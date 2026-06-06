import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectPostgres, disconnectPostgres } from './database/postgres/connection.js';
import { connectRedis, disconnectRedis } from './database/redis/connection.js';
import { initSocket } from './socket/index.js';

async function main() {
  await connectPostgres();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`Codex API listening on http://localhost:${config.port}`);
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
