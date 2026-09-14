import { query } from '../../config/db';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activity.logger';
import { AuthUser } from '../../middleware/auth.middleware';

// Allowed State Transitions State Machine
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Assigned', 'In Progress', 'Closed'],
  Assigned: ['In Progress', 'Pending', 'Closed'],
  'In Progress': ['Resolved', 'Assigned', 'Pending', 'Closed'],
  Resolved: ['Closed', 'In Progress'], // 'In Progress' acts as Reopen
  Closed: ['In Progress'], // Reopen
};

export class AdminService {
  /**
   * 1. Get aggregate summary metrics for Admin Dashboard
   */
  static async getDashboardSummary() {
    const countsQuery = `
      SELECT 
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'Assigned') AS assigned_count,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_count,
        COUNT(*) FILTER (WHERE status = 'Closed') AS closed_count,
        COUNT(*) FILTER (WHERE priority = 'High' OR priority = 'Critical') AS high_critical_count
      FROM requests
    `;

    const userCountQuery = `
      SELECT 
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'admin') AS admin_count,
        COUNT(*) FILTER (WHERE is_active = TRUE) AS active_users
      FROM users
    `;

    const [countsResult, userCountResult] = await Promise.all([
      query(countsQuery),
      query(userCountQuery),
    ]);

    const counts = countsResult.rows[0];
    const userCounts = userCountResult.rows[0];

    return {
      total_requests: parseInt(counts.total_requests || '0', 10),
      pending_count: parseInt(counts.pending_count || '0', 10),
      assigned_count: parseInt(counts.assigned_count || '0', 10),
      in_progress_count: parseInt(counts.in_progress_count || '0', 10),
      resolved_count: parseInt(counts.resolved_count || '0', 10),
      closed_count: parseInt(counts.closed_count || '0', 10),
      high_critical_count: parseInt(counts.high_critical_count || '0', 10),
      users: {
        total: parseInt(userCounts.total_users || '0', 10),
        admins: parseInt(userCounts.admin_count || '0', 10),
        active: parseInt(userCounts.active_users || '0', 10),
      },
    };
  }

  /**
   * 2. List all requests with search, filtering and pagination
   */
  static async getAllRequests(filters: {
    page: number;
    limit: number;
    status?: string;
    priority?: string;
    category_id?: number;
    assigned_to?: number;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }) {
    const { page, limit, status, priority, category_id, assigned_to, search, sortBy, sortOrder } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`r.status = $${paramIndex++}`);
      params.push(status);
    }

    if (priority) {
      conditions.push(`r.priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (category_id) {
      conditions.push(`r.category_id = $${paramIndex++}`);
      params.push(category_id);
    }

    if (assigned_to) {
      conditions.push(`latest_assign.assigned_to = $${paramIndex++}`);
      params.push(assigned_to);
    }

    if (search && search.trim() !== '') {
      conditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Order By Sanitization
    const allowedSortColumns: Record<string, string> = {
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
      priority: 'r.priority',
      status: 'r.status',
      title: 'r.title',
    };
    const sortCol = allowedSortColumns[sortBy] || 'r.created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count Total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM requests r
      LEFT JOIN (
        SELECT DISTINCT ON (request_id) request_id, assigned_to
        FROM assignments
        ORDER BY request_id, assigned_at DESC
      ) latest_assign ON latest_assign.request_id = r.id
      ${whereClause}
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // Fetch Paginated Records
    const dataSql = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category_id,
        c.name AS category_name,
        r.user_id AS requester_id,
        u.full_name AS requester_name,
        u.email AS requester_email,
        r.status,
        r.priority,
        r.created_at,
        r.updated_at,
        r.resolved_at,
        latest_assign.assigned_to,
        staff.full_name AS assigned_to_name,
        staff.email AS assigned_to_email
      FROM requests r
      JOIN categories c ON c.id = r.category_id
      JOIN users u ON u.id = r.user_id
      LEFT JOIN (
        SELECT DISTINCT ON (request_id) request_id, assigned_to, assigned_at
        FROM assignments
        ORDER BY request_id, assigned_at DESC
      ) latest_assign ON latest_assign.request_id = r.id
      LEFT JOIN users staff ON staff.id = latest_assign.assigned_to
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataParams = [...params, limit, offset];
    const dataRes = await query(dataSql, dataParams);

    return {
      data: dataRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Update Request Status with State Machine validation
   */
  static async updateRequestStatus(requestId: number, newStatus: string, actor: AuthUser, note?: string) {
    const existing = await query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (existing.rows.length === 0) {
      throw new AppError('Request not found', 404);
    }

    const currentStatus = existing.rows[0].status;

    if (currentStatus === newStatus) {
      return existing.rows[0];
    }

    // State machine check
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}`,
        400
      );
    }

    const isResolved = newStatus === 'Resolved' || newStatus === 'Closed';
    const updateSql = `
      UPDATE requests
      SET 
        status = $1,
        updated_at = NOW(),
        resolved_at = CASE WHEN $2 THEN NOW() ELSE resolved_at END
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateSql, [newStatus, isResolved, requestId]);
    const updated = result.rows[0];

    // Log Activity
    const actionType = newStatus === 'Resolved' ? 'RESOLVED' : newStatus === 'Closed' ? 'CLOSED' : 'STATUS_CHANGED';
    const details = `Status changed from '${currentStatus}' to '${newStatus}'${note ? ` - Note: ${note}` : ''}`;
    await logActivity(requestId, actor.id, actionType, details);

    return updated;
  }

  /**
   * 4. Update Request Priority
   */
  static async updateRequestPriority(requestId: number, newPriority: string, actor: AuthUser) {
    const existing = await query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (existing.rows.length === 0) {
      throw new AppError('Request not found', 404);
    }

    const oldPriority = existing.rows[0].priority;
    if (oldPriority === newPriority) {
      return existing.rows[0];
    }

    const updateSql = `
      UPDATE requests
      SET priority = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(updateSql, [newPriority, requestId]);
    const updated = result.rows[0];

    await logActivity(
      requestId,
      actor.id,
      'PRIORITY_CHANGED',
      `Priority changed from '${oldPriority}' to '${newPriority}'`
    );

    return updated;
  }

  /**
   * 5. Assign Request to Staff Member
   */
  static async assignRequest(requestId: number, assignedToId: number, actor: AuthUser) {
    // Check request existence
    const requestRes = await query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (requestRes.rows.length === 0) {
      throw new AppError('Request not found', 404);
    }
    const currentRequest = requestRes.rows[0];

    // Check assignee existence
    const userRes = await query('SELECT id, full_name, role, is_active FROM users WHERE id = $1', [assignedToId]);
    if (userRes.rows.length === 0) {
      throw new AppError('Assignee user not found', 404);
    }
    const staff = userRes.rows[0];

    if (!staff.is_active) {
      throw new AppError('Cannot assign request to a deactivated user', 400);
    }

    // Insert into assignments table
    const assignSql = `
      INSERT INTO assignments (request_id, assigned_to, assigned_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const assignRes = await query(assignSql, [requestId, assignedToId, actor.id]);

    // Update status to 'Assigned' if it is currently 'Pending'
    let updatedStatus = currentRequest.status;
    if (currentRequest.status === 'Pending') {
      await query(`UPDATE requests SET status = 'Assigned', updated_at = NOW() WHERE id = $1`, [requestId]);
      updatedStatus = 'Assigned';
    }

    // Log Activity
    await logActivity(
      requestId,
      actor.id,
      'ASSIGNED',
      `Assigned to ${staff.full_name} (ID: ${staff.id}) by Admin ${actor.full_name}`
    );

    return {
      assignment: assignRes.rows[0],
      assigned_to: {
        id: staff.id,
        full_name: staff.full_name,
      },
      status: updatedStatus,
    };
  }

  /**
   * 6. List Users for User Management
   */
  static async getUsers(options?: { role?: string; is_active?: boolean; search?: string }) {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (options?.role) {
      conditions.push(`role = $${idx++}`);
      params.push(options.role);
    }

    if (options?.is_active !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      params.push(options.is_active);
    }

    if (options?.search && options.search.trim() !== '') {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, full_name, email, role, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * 7. Update User status (active/deactivate) or role
   */
  static async updateUser(userId: number, data: { is_active?: boolean; role?: 'user' | 'admin' }, actor: AuthUser) {
    if (userId === actor.id && data.is_active === false) {
      throw new AppError('You cannot deactivate your own admin account', 400);
    }

    const existing = await query('SELECT id, full_name, email, role, is_active FROM users WHERE id = $1', [userId]);
    if (existing.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${idx++}`);
      params.push(data.is_active);
    }

    if (data.role !== undefined) {
      updates.push(`role = $${idx++}`);
      params.push(data.role);
    }

    if (updates.length === 0) {
      return existing.rows[0];
    }

    params.push(userId);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, full_name, email, role, is_active, created_at
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * 8. Get Categories list
   */
  static async getCategories() {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  }
}
