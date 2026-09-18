import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export type UserRole = 'student' | 'lecturer' | 'staff' | 'support_staff' | 'admin' | 'user';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole | string;
  full_name: string;
  department?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // MOCK FOR PERSON 1/2 INTEGRATION
  if (token === 'demo_token') {
    req.user = {
      id: 1,
      email: 'admin@resolvex.com',
      role: 'admin',
      full_name: 'Admin Harsha'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};
