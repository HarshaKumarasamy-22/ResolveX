import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// Protect ALL admin routes with JWT Auth + Admin Role Check
router.use(authenticateJWT);
router.use(requireRole('admin'));

// 1. Dashboard Summary
router.get('/dashboard/summary', AdminController.getDashboardSummary);

// 2. Manage Requests
router.get('/requests', AdminController.getAllRequests);
router.patch('/requests/:id/status', AdminController.updateStatus);
router.patch('/requests/:id/priority', AdminController.updatePriority);
router.post('/requests/:id/assign', AdminController.assignRequest);

// 3. User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUser);

// 4. Metadata
router.get('/categories', AdminController.getCategories);

export default router;
