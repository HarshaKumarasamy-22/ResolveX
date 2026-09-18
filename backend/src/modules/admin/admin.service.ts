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
        COUNT(*) FILTER (WHERE priority = 'Urgent' OR priority = 'High') AS urgent_high_count
      FROM requests
    `;

    const userCountQuery = `
      SELECT 
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'admin') AS admin_count,
        COUNT(*) FILTER (WHERE role = 'support_staff') AS support_staff_count,
        COUNT(*) FILTER (WHERE role = 'student') AS student_count,
        COUNT(*) FILTER (WHERE role = 'lecturer') AS lecturer_count,
        COUNT(*) FILTER (WHERE role = 'staff') AS staff_count,
        COUNT(*) FILTER (WHERE is_active = TRUE) AS active_users
      FROM users
    `;

    const deptDistributionQuery = `
      SELECT department, COUNT(*) AS request_count
      FROM requests
      GROUP BY department
      ORDER BY request_count DESC
    `;

    const catDistributionQuery = `
      SELECT c.name AS category_name, COUNT(r.id) AS request_count
      FROM categories c
      LEFT JOIN requests r ON r.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY request_count DESC
    `;

    const roleDistributionQuery = `
      SELECT u.role, COUNT(r.id) AS request_count
      FROM requests r
      JOIN users u ON u.id = r.user_id
      GROUP BY u.role
      ORDER BY request_count DESC
    `;

    const [countsResult, userCountResult, deptResult, catResult, roleResult] = await Promise.all([
      query(countsQuery),
      query(userCountQuery),
      query(deptDistributionQuery),
      query(catDistributionQuery),
      query(roleDistributionQuery),
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
      urgent_high_count: parseInt(counts.urgent_high_count || '0', 10),
      users: {
        total: parseInt(userCounts.total_users || '0', 10),
        admins: parseInt(userCounts.admin_count || '0', 10),
        support_staff: parseInt(userCounts.support_staff_count || '0', 10),
        students: parseInt(userCounts.student_count || '0', 10),
        lecturers: parseInt(userCounts.lecturer_count || '0', 10),
        staff: parseInt(userCounts.staff_count || '0', 10),
        active: parseInt(userCounts.active_users || '0', 10),
      },
      by_department: deptResult.rows.map(r => ({
        department: r.department,
        count: parseInt(r.request_count, 10),
      })),
      by_category: catResult.rows.map(r => ({
        category: r.category_name,
        count: parseInt(r.request_count, 10),
      })),
      by_role: roleResult.rows.map(r => ({
        role: r.role,
        count: parseInt(r.request_count, 10),
      })),
    };
  }

  /**
   * 2. List all requests with search, filtering (including requester_role) and pagination
   */
  static async getAllRequests(filters: {
    page: number;
    limit: number;
    status?: string;
    priority?: string;
    category_id?: number;
    department?: string;
    location?: string;
    assigned_team?: string;
    assigned_to?: number;
    requester_role?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }) {
    const { page, limit, status, priority, category_id, department, location, assigned_team, assigned_to, requester_role, search, sortBy, sortOrder } = filters;
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

    if (department) {
      conditions.push(`r.department = $${paramIndex++}`);
      params.push(department);
    }

    if (location) {
      conditions.push(`r.location = $${paramIndex++}`);
      params.push(location);
    }

    if (assigned_team) {
      conditions.push(`r.assigned_team = $${paramIndex++}`);
      params.push(assigned_team);
    }

    if (assigned_to) {
      conditions.push(`latest_assign.assigned_to = $${paramIndex++}`);
      params.push(assigned_to);
    }

    if (requester_role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(requester_role);
    }

    if (search && search.trim() !== '') {
      conditions.push(`(
        r.title ILIKE $${paramIndex} OR 
        r.description ILIKE $${paramIndex} OR 
        r.request_code ILIKE $${paramIndex} OR 
        u.full_name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR 
        r.room_number ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortColumns: Record<string, string> = {
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
      priority: 'r.priority',
      status: 'r.status',
      title: 'r.title',
      request_code: 'r.request_code',
      department: 'r.department',
    };
    const sortCol = allowedSortColumns[sortBy] || 'r.created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count Total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM requests r
      JOIN users u ON u.id = r.user_id
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
        r.request_code,
        r.title,
        r.description,
        r.category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        r.user_id AS requester_id,
        u.full_name AS requester_name,
        u.email AS requester_email,
        u.role AS requester_role,
        r.department,
        r.location,
        r.room_number,
        r.status,
        r.priority,
        r.assigned_team,
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
        SELECT DISTINCT ON (request_id) request_id, assigned_to, assigned_team, assigned_at
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
      throw new AppError('Service request not found', 404);
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
    const details = `Status changed from '${currentStatus}' to '${newStatus}' by ${actor.full_name}${note ? ` - Note: ${note}` : ''}`;
    await logActivity(requestId, actor.id, actionType, details);

    return updated;
  }

  /**
   * 4. Update Request Priority
   */
  static async updateRequestPriority(requestId: number, newPriority: string, actor: AuthUser) {
    const existing = await query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (existing.rows.length === 0) {
      throw new AppError('Service request not found', 404);
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
      `Priority updated from '${oldPriority}' to '${newPriority}' by ${actor.full_name}`
    );

    return updated;
  }

  /**
   * 5. Assign Request to Support Team and/or Staff Member
   */
  static async assignRequest(
    requestId: number,
    assignmentData: { assigned_to?: number; assigned_team?: string },
    actor: AuthUser
  ) {
    const requestRes = await query('SELECT * FROM requests WHERE id = $1', [requestId]);
    if (requestRes.rows.length === 0) {
      throw new AppError('Service request not found', 404);
    }
    const currentRequest = requestRes.rows[0];

    let staffName = 'Designated Support Team';
    let assignedToId = assignmentData.assigned_to || null;

    if (assignedToId) {
      const userRes = await query('SELECT id, full_name, role, is_active FROM users WHERE id = $1', [assignedToId]);
      if (userRes.rows.length === 0) {
        throw new AppError('Assignee user not found', 404);
      }
      const staff = userRes.rows[0];
      if (!staff.is_active) {
        throw new AppError('Cannot assign request to a deactivated user', 400);
      }
      staffName = staff.full_name;
    }

    // Insert into assignments audit table if assigned_to is present
    let assignmentRecord = null;
    if (assignedToId) {
      const assignSql = `
        INSERT INTO assignments (request_id, assigned_to, assigned_by, assigned_team)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const assignRes = await query(assignSql, [
        requestId,
        assignedToId,
        actor.id,
        assignmentData.assigned_team || currentRequest.assigned_team,
      ]);
      assignmentRecord = assignRes.rows[0];
    }

    // Update request record with assigned_team and status
    const newStatus = currentRequest.status === 'Pending' ? 'Assigned' : currentRequest.status;
    const updateSql = `
      UPDATE requests 
      SET 
        assigned_team = COALESCE($1, assigned_team),
        status = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const updateRes = await query(updateSql, [
      assignmentData.assigned_team || null,
      newStatus,
      requestId,
    ]);

    // Log Activity
    const teamText = assignmentData.assigned_team ? ` [Team: ${assignmentData.assigned_team}]` : '';
    await logActivity(
      requestId,
      actor.id,
      'ASSIGNED',
      `Assigned to ${staffName}${teamText} by Admin ${actor.full_name}`
    );

    return {
      assignment: assignmentRecord,
      request: updateRes.rows[0],
      status: newStatus,
      assigned_to_name: staffName,
      assigned_team: updateRes.rows[0].assigned_team,
    };
  }

  /**
   * 6. Export all requests to CSV formatted string
   */
  static async exportRequestsCsv(filters: any) {
    const result = await this.getAllRequests({
      ...filters,
      page: 1,
      limit: 10000,
    });

    const requests = result.data;
    const headers = [
      'Ticket Code',
      'Title',
      'Category',
      'Faculty / Department',
      'Campus Location',
      'Room / Lab No',
      'Priority',
      'Status',
      'Assigned Team',
      'Assigned Staff',
      'Requester Name',
      'Requester Role',
      'Requester Email',
      'Created At',
      'Resolved At',
      'Description',
    ];

    const rows = requests.map(r => [
      `"${r.request_code || `AIT-${r.id}`}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${r.category_name || ''}"`,
      `"${r.department || ''}"`,
      `"${r.location || ''}"`,
      `"${r.room_number || ''}"`,
      r.priority,
      r.status,
      `"${r.assigned_team || 'Unassigned'}"`,
      `"${r.assigned_to_name || 'Unassigned'}"`,
      `"${r.requester_name || ''}"`,
      `"${r.requester_role || 'student'}"`,
      r.requester_email || '',
      new Date(r.created_at).toISOString(),
      r.resolved_at ? new Date(r.resolved_at).toISOString() : '',
      `"${(r.description || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  /**
   * 7. List Users for User Management
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
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR department ILIKE $${idx})`);
      params.push(`%${options.search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, full_name, email, role, department, phone, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * 8. Update User status or role
   */
  static async updateUser(userId: number, data: { is_active?: boolean; role?: any; department?: string }, actor: AuthUser) {
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

    if (data.department !== undefined) {
      updates.push(`department = $${idx++}`);
      params.push(data.department);
    }

    if (updates.length === 0) {
      return existing.rows[0];
    }

    params.push(userId);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, full_name, email, role, department, is_active, created_at
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * 9. Get Categories list
   */
  static async getCategories() {
    const result = await query('SELECT * FROM categories ORDER BY id ASC');
    return result.rows;
  }
}
