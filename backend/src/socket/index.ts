import type { Server as HttpServer } from 'node:http';
import type { Server } from 'socket.io';

/** Role C — attach Socket.io in M5 */
export function initSocket(_httpServer: HttpServer): Server | null {
  console.log('[socket.io] stub — implement in M5');
  return null;
}

export function getIO(): Server | null {
  return null;
}
