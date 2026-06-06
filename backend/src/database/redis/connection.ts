import { createClient, type RedisClientType } from 'redis';
import { config } from '../../config/index.js';

let client: RedisClientType | null = null;

export async function connectRedis(): Promise<void> {
  if (client?.isOpen) return;

  client = createClient({ url: config.redis.url });
  client.on('error', (err) => console.error('[redis] error', err));
  await client.connect();
  console.log('[redis] connected');
}

export function getRedis(): RedisClientType {
  if (!client?.isOpen) {
    throw new Error('Redis client not initialized — call connectRedis() first');
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
    client = null;
    console.log('[redis] disconnected');
  }
}
