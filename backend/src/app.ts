import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import adminRoutes from './modules/admin/admin.routes';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    app: 'ResolveX API',
    timestamp: new Date().toISOString(),
  });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
