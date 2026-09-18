import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { query } from '../../config/db';

export const getSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summaryResult = await query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned_requests,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_requests,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_requests,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_requests,
        SUM(CASE WHEN priority IN ('High', 'Urgent', 'Critical') THEN 1 ELSE 0 END) as high_critical_requests
      FROM requests
    `);

    res.status(200).json({
      success: true,
      data: summaryResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getByCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryResult = await query(`
      SELECT c.name as category, COUNT(r.id) as count
      FROM categories c
      LEFT JOIN requests r ON c.id = r.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: categoryResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getByStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const statusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM requests
      GROUP BY status
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: statusResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getByPriority = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const priorityResult = await query(`
      SELECT priority, COUNT(*) as count
      FROM requests
      GROUP BY priority
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: priorityResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getByDepartment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departmentResult = await query(`
      SELECT COALESCE(department, 'General / Other') as department, COUNT(*) as count
      FROM requests
      GROUP BY department
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: departmentResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getByLocation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationResult = await query(`
      SELECT COALESCE(location, 'Campus Wide') as location, COUNT(*) as count
      FROM requests
      GROUP BY location
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: locationResult.rows,
    });
  } catch (error) {
    next(error);
  }
};
