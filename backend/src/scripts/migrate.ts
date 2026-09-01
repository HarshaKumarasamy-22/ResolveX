import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function runMigration() {
  console.log('🔄 Connecting to Supabase PostgreSQL...');

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('🚀 Applying schema.sql to Supabase...');
    await pool.query(schemaSql);
    console.log('✅ Schema tables created successfully!');

    console.log('🌱 Applying seed.sql (demo users, categories, tickets, logs)...');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    console.log('🎉 Supabase Database is 100% migrated and ready for ResolveX!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
