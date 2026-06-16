// utils/auth.js
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '30d';

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set to sign tokens');
  }
  return jwt.sign({ orgId: user._id.toString() }, secret, {
    expiresIn: TOKEN_EXPIRATION,
    subject: user._id.toString(),
  });
}
