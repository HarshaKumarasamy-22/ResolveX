import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { query } from '../../config/db';
import { logActivity } from '../../utils/activity.logger';

export const addComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!message || message.trim() === '') {
      res.status(400).json({ success: false, message: 'Comment message is required' });
      return;
    }

    // Check if request exists
    const requestResult = await query('SELECT id FROM requests WHERE id = $1', [id]);
    if (requestResult.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    // Insert comment
    const insertResult = await query(
      `INSERT INTO comments (request_id, user_id, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, message.trim()]
    );

    const newComment = insertResult.rows[0];

    // Log Activity
    const authorName = req.user?.full_name || 'User';
    await logActivity(
      Number(id),
      userId,
      'COMMENTED',
      `Comment added by ${authorName}`
    );

    // Fetch comment with user details for response
    const commentWithUser = await query(
      `SELECT c.id, c.request_id, c.message, c.created_at, 
              u.id as user_id, u.full_name as author_name, u.role as author_role, u.department as author_department
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [newComment.id]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: commentWithUser.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
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

    const commentsResult = await query(
      `SELECT c.id, c.request_id, c.message, c.created_at, 
              u.id as user_id, u.full_name as author_name, u.role as author_role, u.department as author_department
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.request_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: commentsResult.rows,
    });
  } catch (error) {
    next(error);
  }
};
