import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/AppError.js';
import { toAuthUser } from '../users/users.mapper.js';
import * as usersRepo from '../users/users.repository.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';

const BCRYPT_ROUNDS = 10;

function defaultUsername(email: string): string {
  return email.split('@')[0].slice(0, 100);
}

export async function register(input: RegisterInput) {
  const existing = await usersRepo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'VALIDATION_ERROR', 'Email already registered');
  }

  const username = input.profile?.username ?? defaultUsername(input.email);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await usersRepo.createUserWithProfileAndWallet({
    email: input.email,
    passwordHash,
    role: input.role,
    username,
    bio: input.profile?.bio ?? '',
    tags: input.profile?.tags ?? [],
    coinRatePerSession: input.profile?.coinRatePerSession ?? 0,
  });

  return toAuthUser(user);
}

export async function login(input: LoginInput) {
  const user = await usersRepo.findUserByEmail(input.email);
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  return toAuthUser(user);
}

export async function getMe(userId: string) {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'UNAUTHORIZED', 'User not found');
  }
  return toAuthUser(user);
}
