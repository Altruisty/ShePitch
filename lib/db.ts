import mysql from 'mysql2/promise';

// Create a connection pool configured for high concurrency (200+ req/sec)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.169.147.255',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'MEAZHA',
  password: process.env.DB_PASS || 'dZYRYi(o(0*U',
  database: process.env.DB_NAME || 'le_test',
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;
