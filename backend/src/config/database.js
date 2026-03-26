const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool = null;

const createPool = () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_career_os',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+00:00',
    charset: 'utf8mb4',
    waitForConnections: true,
  });

  pool.on('connection', (connection) => {
    logger.debug(`MySQL connection established: ${connection.threadId}`);
  });

  return pool;
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const poolInstance = getPool();
      const connection = await poolInstance.getConnection();
      await connection.ping();
      connection.release();
      logger.info('✅ MySQL connected successfully');
      return poolInstance;
    } catch (error) {
      attempt++;
      logger.error(`MySQL connection attempt ${attempt} failed: ${error.message}`);
      if (attempt >= maxRetries) throw new Error(`Failed to connect after ${maxRetries} attempts`);
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
};

const query = async (sql, params = []) => {
  const poolInstance = getPool();
  const [rows] = await poolInstance.execute(sql, params);
  return rows;
};

const transaction = async (callback) => {
  const poolInstance = getPool();
  const connection = await poolInstance.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { connectDB, getPool, query, transaction };
