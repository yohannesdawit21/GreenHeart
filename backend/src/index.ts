import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectPostgres, disconnectPostgres } from './database/postgres/connection.js';
import { connectRedis, disconnectRedis } from './database/redis/connection.js';
import { initSocket } from './socket/index.js';
import { logCorsMode } from './shared/middleware/cors.middleware.js';

async function main() {
  logCorsMode();
  await connectPostgres();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  initSocket(httpServer);

  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`Codex API listening on 0.0.0.0:${config.port}`);
  });

  const shutdown = async () => {
    await disconnectPostgres();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
