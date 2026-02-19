import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// TODO: REQUIRED INFO HERE (fill this in): Ensure .env file has correct database credentials
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✓ Database connection pool established');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.error('  Please check your .env file has correct DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  });

export default pool;
