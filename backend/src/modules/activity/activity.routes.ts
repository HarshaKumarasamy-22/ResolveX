import { Router } from 'express';
import { getActivityLogs } from './activity.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticateJWT, getActivityLogs);

export default router;
