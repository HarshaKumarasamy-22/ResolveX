import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AdminService } from './admin.service';
import {
  adminRequestQuerySchema,
  updateStatusSchema,
  updatePrioritySchema,
  assignRequestSchema,
  updateUserSchema,
} from './admin.validator';

export class AdminController {
  /**
   * GET /api/admin/dashboard/summary
   */
  static async getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await AdminService.getDashboardSummary();
      res.json({
        success: true,
        message: 'Admin dashboard summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/requests
   */
  static async getAllRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = adminRequestQuerySchema.parse(req.query);
      const result = await AdminService.getAllRequests(filters);
      res.json({
        success: true,
        message: 'Requests fetched successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/requests/:id/status
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestId = parseInt(idParam, 10);
      const { status, note } = updateStatusSchema.parse(req.body);
      const updated = await AdminService.updateRequestStatus(requestId, status, req.user!, note);

      res.json({
        success: true,
        message: `Request #${requestId} status updated to '${status}' successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/requests/:id/priority
   */
  static async updatePriority(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestId = parseInt(idParam, 10);
      const { priority } = updatePrioritySchema.parse(req.body);
      const updated = await AdminService.updateRequestPriority(requestId, priority, req.user!);

      res.json({
        success: true,
        message: `Request #${requestId} priority updated to '${priority}' successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/requests/:id/assign
   */
  static async assignRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestId = parseInt(idParam, 10);
      const { assigned_to } = assignRequestSchema.parse(req.body);
      const result = await AdminService.assignRequest(requestId, assigned_to, req.user!);

      res.status(200).json({
        success: true,
        message: `Request #${requestId} assigned successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   */
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, is_active, search } = req.query;
      const users = await AdminService.getUsers({
        role: typeof role === 'string' ? role : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        search: typeof search === 'string' ? search : undefined,
      });

      res.json({
        success: true,
        message: 'Users list retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   */
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = parseInt(idParam, 10);
      const body = updateUserSchema.parse(req.body);
      const updated = await AdminService.updateUser(userId, body, req.user!);

      res.json({
        success: true,
        message: `User #${userId} updated successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/categories
   */
  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await AdminService.getCategories();
      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
