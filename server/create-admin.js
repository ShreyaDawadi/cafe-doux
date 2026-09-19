require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function createAdmin() {
  const name = 'Thamel Branch Manager';
  const email = 'admin.thamel@cafedoux.com';
  const password = 'adminpass123';
  const branchId = 1; // Thamel branch

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, branch_id',
    [name, email, passwordHash, 'branch_admin', branchId]
  );

  console.log('Admin created:', result.rows[0]);
  process.exit(0);
}

createAdmin();