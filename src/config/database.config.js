/**
 * Database Configuration
 * Configuration for local database (if needed for caching, sessions, etc.)
 * This is separate from Odoo database
 */

const databaseConfig = {
  // PostgreSQL configuration (optional - for local caching/sessions)
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'hrms_connector',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    }
  },

  // MongoDB configuration (optional - for session storage)
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_connector',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: parseInt(process.env.MONGO_POOL_SIZE, 10) || 10
    }
  },

  // Redis configuration is in main config (used for caching)
};

module.exports = databaseConfig;
