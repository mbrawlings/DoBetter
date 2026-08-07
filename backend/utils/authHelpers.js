import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const CODE_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

export function assertValidEmail(email) {
  if (!EMAIL_RE.test(email)) {
    throw new Error('Invalid email address');
  }
}

export function assertPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

export function createVerificationCode() {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  return code;
}

export async function hashVerificationCode(code) {
  return bcrypt.hash(code, 10);
}

export async function isCorrectVerificationCode(user, code) {
  if (!user?.emailVerificationCodeHash || !code) {
    return false;
  }
  if (
    !user.emailVerificationExpiresAt ||
    new Date(user.emailVerificationExpiresAt).getTime() < Date.now()
  ) {
    return false;
  }
  return bcrypt.compare(String(code).trim(), user.emailVerificationCodeHash);
}

export function verificationExpiryDate() {
  return new Date(Date.now() + CODE_TTL_MS);
}

/**
 * Legacy users (no verified timestamp and no pending code) stay usable.
 * New signups always have a pending code until verified.
 */
export function isEmailVerified(user) {
  if (user?.emailVerifiedAt) {
    return true;
  }
  if (!user?.emailVerificationCodeHash) {
    return true;
  }
  return false;
}

export async function assignVerificationCode(user) {
  const code = createVerificationCode();
  user.emailVerificationCodeHash = await hashVerificationCode(code);
  user.emailVerificationExpiresAt = verificationExpiryDate();
  user.emailVerifiedAt = null;
  return code;
}

export function clearVerificationCode(user) {
  user.emailVerificationCodeHash = null;
  user.emailVerificationExpiresAt = null;
}
