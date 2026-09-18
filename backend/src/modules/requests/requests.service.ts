import { query } from '../../config/db';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activity.logger';
import { AuthUser } from '../../middleware/auth.middleware';
import { CreateRequestInput, RequestQueryParams } from './requests.validator';

// 5 Main AIT Academic & Support Divisions
export const AIT_DEPARTMENTS = [
  'Faculty of Computing & Software Engineering',
  'Faculty of Engineering & Technology',
  'Faculty of Business & Management',
  'Faculty of Design & Digital Media',
  'Student Affairs & Support Services',
];

// 11 Campus Locations
export const AIT_LOCATIONS = [
  'Computing Building',
  'Engineering Building',
  'Business Building',
  'Design Building',
  'Administration Building',
  'Student Centre',
  'Library',
  'Innovation Centre',
  'Cafeteria',
  'Lecture Halls',
  'Computer Laboratories',
];

// 5 Support Teams
export const AIT_SUPPORT_TEAMS = [
  'IT Support',
  'Network Support',
  'Facilities & Maintenance',
  'Laboratory Support',
  'Student Services',
];

export const AIT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const AIT_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export class RequestsService {
  /**
   * 1. Create a new Service Request (Student / Lecturer / Staff)
   */
  static async createRequest(data: CreateRequestInput, actor: AuthUser) {
    // Validate category existence
    const catRes = await query('SELECT id, name FROM categories WHERE id = $1', [data.category_id]);
    if (catRes.rows.length === 0) {
      throw new AppError('Invalid category selected', 400);
    }
    const category = catRes.rows[0];

    // Generate formatted Request Code: AIT-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const countRes = await query('SELECT COUNT(*) AS total FROM requests');
    const nextSeq = parseInt(countRes.rows[0]?.total || '0', 10) + 1;
    const requestCode = `AIT-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

    const insertSql = `
      INSERT INTO requests (
        request_code,
        title,
        description,
        category_id,
        user_id,
        department,
        location,
        room_number,
        priority,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', NOW(), NOW())
      RETURNING *
    `;

    const values = [
      requestCode,
      data.title.trim(),
      data.description.trim(),
      data.category_id,
      actor.id,
      data.department,
      data.location,
      data.room_number || '',
      data.priority || 'Medium',
    ];

    const result = await query(insertSql, values);
    const newRequest = result.rows[0];

    // Audit Trail: Log Creation Activity
    await logActivity(
      newRequest.id,
      actor.id,
      'CREATED',
      `Service request ${requestCode} created with ${data.priority || 'Medium'} priority in ${data.department} (${data.location}) by ${actor.full_name}`
    );

    return {
      ...newRequest,
      category_name: category.name,
      requester_name: actor.full_name,
      requester_email: actor.email,
    };
  }

  /**
   * 2. Get requests created by the authenticated user (My Requests)
   */
  static async getMyRequests(userId: number, filters: RequestQueryParams) {
    const { page, limit, status, priority, category_id, department, location, search, sortBy, sortOrder } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['r.user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

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

    if (search && search.trim() !== '') {
      conditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex} OR r.request_code ILIKE $${paramIndex} OR r.room_number ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const allowedSortColumns: Record<string, string> = {
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
      priority: 'r.priority',
      status: 'r.status',
      title: 'r.title',
      request_code: 'r.request_code',
    };
    const sortCol = allowedSortColumns[sortBy] || 'r.created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count Total
    const countSql = `SELECT COUNT(*) AS total FROM requests r ${whereClause}`;
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
   * 3. Get single Request by ID
   */
  static async getRequestById(requestId: number, actor: AuthUser) {
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
        u.department AS requester_department,
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
      WHERE r.id = $1
    `;

    const result = await query(dataSql, [requestId]);
    if (result.rows.length === 0) {
      throw new AppError('Service request not found', 404);
    }

    const reqData = result.rows[0];

    // Non-admin / non-staff users can only view their own requests
    const privilegedRoles = ['admin', 'support_staff'];
    if (!privilegedRoles.includes(actor.role) && reqData.requester_id !== actor.id) {
      throw new AppError('Access denied. You can only view your own service requests.', 403);
    }

    return reqData;
  }

  /**
   * 4. User Dashboard summary metrics (My summary)
   */
  static async getUserSummary(userId: number) {
    const summarySql = `
      SELECT 
        COUNT(*) AS total_submitted,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'Assigned') AS assigned_count,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_count,
        COUNT(*) FILTER (WHERE status = 'Closed') AS closed_count
      FROM requests
      WHERE user_id = $1
    `;

    const res = await query(summarySql, [userId]);
    const row = res.rows[0];

    return {
      total_submitted: parseInt(row.total_submitted || '0', 10),
      pending_count: parseInt(row.pending_count || '0', 10),
      assigned_count: parseInt(row.assigned_count || '0', 10),
      in_progress_count: parseInt(row.in_progress_count || '0', 10),
      resolved_count: parseInt(row.resolved_count || '0', 10),
      closed_count: parseInt(row.closed_count || '0', 10),
    };
  }

  /**
   * 5. Get Metadata Options (AIT Categories, Departments, Locations, Support Teams)
   */
  static async getMetadataOptions() {
    const catRes = await query('SELECT * FROM categories ORDER BY id ASC');
    return {
      categories: catRes.rows,
      departments: AIT_DEPARTMENTS,
      locations: AIT_LOCATIONS,
      support_teams: AIT_SUPPORT_TEAMS,
      priorities: AIT_PRIORITIES,
      statuses: AIT_STATUSES,
    };
  }
}
