import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import type { Socket } from 'socket.io';
import { config } from '../config/index.js';
import type { AuthPayload } from '../shared/middleware/auth.middleware.js';

const AUTH_COOKIE = 'auth_token';

export function authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
  try {
    const handshakeToken = socket.handshake.auth?.token as string | undefined;
    const rawCookie = socket.handshake.headers.cookie;
    const cookies = cookie.parse(rawCookie ?? '');
    const token = handshakeToken ?? cookies[AUTH_COOKIE];

    if (!token) {
      return next(new Error('UNAUTHORIZED'));
    }

    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    socket.data.auth = payload;
    next();
  } catch {
    next(new Error('UNAUTHORIZED'));
  }
}

export function getSocketAuth(socket: Socket): AuthPayload {
  return socket.data.auth as AuthPayload;
}
