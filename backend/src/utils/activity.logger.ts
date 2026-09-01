import { query } from '../config/db';

export type ActionType =
  | 'CREATED'
  | 'ASSIGNED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'COMMENTED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export const logActivity = async (
  requestId: number,
  userId: number,
  actionType: ActionType,
  details: string
): Promise<void> => {
  try {
    await query(
      `INSERT INTO activity_logs (request_id, user_id, action_type, details)
       VALUES ($1, $2, $3, $4)`,
      [requestId, userId, actionType, details]
    );
  } catch (error) {
    console.error('Failed to log activity event:', error);
    // Non-blocking so main business transaction isn't failed by logging glitch
  }
};
