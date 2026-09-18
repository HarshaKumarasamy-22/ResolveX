import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from './auth.middleware';

export const requireRole = (...allowedRoles: (UserRole | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of the following roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
};
