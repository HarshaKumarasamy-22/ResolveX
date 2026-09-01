import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

async function setPasswords() {
  const hash = await bcrypt.hash('Password@123', 10);
  await pool.query('UPDATE users SET password_hash = $1', [hash]);
  console.log('✅ Successfully updated all demo users password to "Password@123"');
  process.exit(0);
}

setPasswords();
