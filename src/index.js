const mongoose = require('mongoose');
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

const numCPUs = os.cpus().length;
const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);

console.log(`CPUs: ${numCPUs}`);
console.log(`Memory: ${totalMemoryGB.toFixed(2)} GB`);

// 🚀 CONDITION: Disable cluster for low resources
const SHOULD_USE_CLUSTER = numCPUs > 1 && totalMemoryGB >= 2;

if (cluster.isPrimary && SHOULD_USE_CLUSTER) {
  logger.info(`Primary process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // 👉 Single process OR worker process
  let server;

  mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(() => {
      logger.info(`Process ${process.pid} connected to MongoDB`);

      server = app.listen(config.port, () => {
        logger.info(`Process ${process.pid} listening on ${config.port}`);
      });
    })
    .catch((err) => {
      logger.error('MongoDB connection failed:', err);
      process.exit(1);
    });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info(`Process ${process.pid} closed server`);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    logger.error(`Process ${process.pid} encountered error:`, error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info(`Process ${process.pid} SIGTERM received`);
    if (server) server.close();
  });
}