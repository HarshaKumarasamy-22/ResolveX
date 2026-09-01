import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool(
  config.databaseUrl
    ? { connectionString: config.databaseUrl, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      }
);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
