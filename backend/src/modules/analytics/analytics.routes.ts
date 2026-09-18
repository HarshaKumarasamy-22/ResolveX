import { Router, Response, NextFunction } from 'express';
import {
  getSummary,
  getByCategory,
  getByStatus,
  getByPriority,
  getByDepartment,
  getByLocation,
} from './analytics.controller';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();

// Middleware ensuring only administrators can access university analytics
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Access is restricted to Aurevia Institute of Technology administrators.',
    });
    return;
  }
  next();
};

router.use(authenticateJWT, requireAdmin);

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/by-status', getByStatus);
router.get('/by-priority', getByPriority);
router.get('/by-department', getByDepartment);
router.get('/by-location', getByLocation);

export default router;
