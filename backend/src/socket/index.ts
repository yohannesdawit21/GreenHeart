import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { authenticateSocket } from './auth.middleware.js';
import { registerSocketHandlers } from './handlers.js';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: config.corsAllowAll
      ? { origin: true, credentials: true }
      : { origin: config.corsOrigins, credentials: true },
  });

  io.use(authenticateSocket);
  registerSocketHandlers(io);
  console.log('[socket.io] initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}

export function isUserSocketConnected(userId: string): boolean {
  if (!io) return false;
  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  return (room?.size ?? 0) > 0;
}
