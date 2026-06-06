import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { authenticateSocket } from './auth.middleware.js';
import { registerSocketHandlers } from './handlers.js';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  io.use(authenticateSocket);
  registerSocketHandlers(io);
  console.log('[socket.io] initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}
