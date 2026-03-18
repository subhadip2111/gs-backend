const mongoose = require('mongoose');
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

const numCPUs = os.cpus().length;
console.log(numCPUs);
if (cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit and restart
  cluster.on('exit', (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  let server;
 mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info(`Worker ${process.pid} connected to MongoDB`);
    server = app.listen(config.port, () => {
      logger.info(`Worker ${process.pid} listening on ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info(`Worker ${process.pid} closed server`);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    logger.error(`Worker ${process.pid} encountered error:`, error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info(`Worker ${process.pid} SIGTERM received`);
    if (server) {
      server.close();
    }

  });
}



