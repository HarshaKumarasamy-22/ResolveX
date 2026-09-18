import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import adminRoutes from './modules/admin/admin.routes';
import requestsRoutes from './modules/requests/requests.routes';
import authRoutes from './modules/auth/auth.routes';
import commentsRoutes from './modules/comments/comments.routes';
import activityRoutes from './modules/activity/activity.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & AIT University Info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    app: 'ResolveX API',
    university: 'Aurevia Institute of Technology (AIT)',
    tagline: 'Innovate. Connect. Resolve.',
    timestamp: new Date().toISOString(),
  });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests/:id/comments', commentsRoutes);
app.use('/api/requests/:id/activity', activityRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
