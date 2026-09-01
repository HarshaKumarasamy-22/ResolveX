import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`===========================================`);
  console.log(`🚀 ResolveX Backend Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Base API URL: http://localhost:${config.port}/api`);
  console.log(`===========================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed gracefully.');
  });
});
