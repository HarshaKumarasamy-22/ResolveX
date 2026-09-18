import { Router } from 'express';
import { getSummary, getByCategory, getByStatus, getByPriority } from './analytics.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticateJWT, getSummary);
router.get('/by-category', authenticateJWT, getByCategory);
router.get('/by-status', authenticateJWT, getByStatus);
router.get('/by-priority', authenticateJWT, getByPriority);

export default router;
