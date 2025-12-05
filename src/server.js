#!/usr/bin/env node

/**
 * HRMS Odoo Connector Server
 * Entry point for the application
 */

const createApp = require('./app');
const config = require('./config');
const { createLogger } = require('./infrastructure/logging/Logger');

const logger = createLogger('Server');

/**
 * Normalize port number
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

/**
 * Start the server
 */
async function startServer() {
  try {
    logger.info('Starting HRMS Odoo Connector...');

    // Create Express app
    const app = createApp();

    // Get port from config
    const port = normalizePort(config.app.port);
    app.set('port', port);

    // Start listening
    const server = app.listen(port, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 HRMS Odoo Connector started successfully`);
      logger.info(`📝 Environment: ${config.app.env}`);
      logger.info(`🌐 Server running on port ${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api-docs`);
      logger.info(`❤️  Health Check: http://localhost:${port}/health`);
      logger.info(`🔗 API Base URL: http://localhost:${port}${config.app.apiPrefix}`);
      logger.info('='.repeat(60));
    });

    // Error handling for server
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Handle server listening event
    server.on('listening', () => {
      const addr = server.address();
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      logger.info(`Server listening on ${bind}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer;
