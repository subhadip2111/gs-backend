const mongoose = require('mongoose');
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

const numCPUs = os.cpus().length;

// ⚠️ IMPORTANT: Render doesn't expose real memory via os.totalmem()
// So we rely on ENV or safe defaults
const MEMORY_LIMIT_MB = process.env.MEMORY_LIMIT_MB
  ? parseInt(process.env.MEMORY_LIMIT_MB)
  : 512; // 👈 default assume low memory (safe)

// 🚀 Smart cluster decision
const SHOULD_USE_CLUSTER =
  process.env.CLUSTER === 'true' && // manual control
  numCPUs > 1 &&
  MEMORY_LIMIT_MB >= 2048; // only allow if 2GB+

// 👇 Limit workers to avoid memory crash
const WORKERS = SHOULD_USE_CLUSTER
  ? Math.min(numCPUs, 2) // 👈 never spawn too many
  : 1;

console.log(`CPUs: ${numCPUs}`);
console.log(`Memory Limit: ${MEMORY_LIMIT_MB} MB`);
console.log(`Cluster Enabled: ${SHOULD_USE_CLUSTER}`);
console.log(`Workers: ${WORKERS}`);

if (cluster.isPrimary && SHOULD_USE_CLUSTER) {
  logger.info(`Primary process ${process.pid} is running`);

  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // 👉 Single process OR worker
  let server;

  mongoose.connect(config.mongoose.url, {
    ...config.mongoose.options,
    maxPoolSize: 5,   // 👈 reduce memory usage
    minPoolSize: 1,
  })
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