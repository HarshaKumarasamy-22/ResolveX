import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { query } from '../../config/db';

export const getActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if request exists
    const requestResult = await query('SELECT id FROM requests WHERE id = $1', [id]);
    if (requestResult.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    const logsResult = await query(
      `SELECT a.id, a.request_id, a.action_type, a.details, a.created_at,
              u.id as user_id, u.full_name as actor_name, u.role as actor_role, u.department as actor_department
       FROM activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.request_id = $1
       ORDER BY a.created_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: logsResult.rows,
    });
  } catch (error) {
    next(error);
  }
};
