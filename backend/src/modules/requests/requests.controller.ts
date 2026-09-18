import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { RequestsService } from './requests.service';
import { createRequestSchema, requestQuerySchema } from './requests.validator';

export class RequestsController {
  /**
   * POST /api/requests
   * Raise a new service request
   */
  static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createRequestSchema.parse(req.body);
      const newRequest = await RequestsService.createRequest(validatedData, req.user!);

      res.status(201).json({
        success: true,
        message: `Service request ${newRequest.request_code} created successfully.`,
        data: newRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/my
   * Get requests raised by logged in user
   */
  static async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = requestQuerySchema.parse(req.query);
      const result = await RequestsService.getMyRequests(req.user!.id, filters);

      res.json({
        success: true,
        message: 'Your service requests fetched successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/my/summary
   * User dashboard summary
   */
  static async getMySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await RequestsService.getUserSummary(req.user!.id);
      res.json({
        success: true,
        message: 'User summary fetched successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/meta
   * Public/Authenticated lookup data for AIT
   */
  static async getMetadata(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = await RequestsService.getMetadataOptions();
      res.json({
        success: true,
        message: 'AIT metadata retrieved successfully',
        data: meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/:id
   * Get single request details
   */
  static async getRequestById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const requestId = parseInt(idParam, 10);
      const requestData = await RequestsService.getRequestById(requestId, req.user!);

      res.json({
        success: true,
        message: 'Request details retrieved successfully',
        data: requestData,
      });
    } catch (error) {
      next(error);
    }
  }
}
