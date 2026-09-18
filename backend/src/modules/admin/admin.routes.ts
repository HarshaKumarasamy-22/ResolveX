import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// Protect ALL admin routes with JWT Auth + Admin/Support Staff Role Check
router.use(authenticateJWT);
router.use(requireRole('admin', 'support_staff'));

// 1. Dashboard Summary
router.get('/dashboard/summary', AdminController.getDashboardSummary);

// 2. CSV Export
router.get('/requests/export/csv', AdminController.exportRequestsCsv);

// 3. Manage Requests
router.get('/requests', AdminController.getAllRequests);
router.patch('/requests/:id/status', AdminController.updateStatus);
router.patch('/requests/:id/priority', AdminController.updatePriority);
router.post('/requests/:id/assign', AdminController.assignRequest);

// 4. User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUser);

// 5. Metadata
router.get('/categories', AdminController.getCategories);

export default router;
