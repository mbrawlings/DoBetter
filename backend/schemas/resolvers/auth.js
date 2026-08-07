import User from '../../db/models/User.js';
import { signToken } from '../../utils/auth.js';
import {
  assignVerificationCode,
  assertPassword,
  assertValidEmail,
  clearVerificationCode,
  isCorrectVerificationCode,
  isEmailVerified,
  normalizeEmail,
} from '../../utils/authHelpers.js';
import { sendVerificationEmail } from '../../utils/email.js';

const Query = {
  async me(_, __, { orgId }) {
    if (!orgId) {
      return null;
    }
    return User.findById(orgId).lean();
  },
};

const Mutation = {
  async login(_, { email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.isCorrectPassword(password))) {
      throw new Error('Invalid email or password');
    }
    if (!isEmailVerified(user)) {
      throw new Error('Email not verified');
    }
    const token = signToken(user);
    return { token, user: user.toObject() };
  },

  async signup(_, { email, password, name }) {
    const normalizedEmail = normalizeEmail(email);
    assertValidEmail(normalizedEmail);
    assertPassword(password);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const user = new User({
      email: normalizedEmail,
      password,
      name: name?.trim() || undefined,
    });

    const code = await assignVerificationCode(user);
    await user.save();

    try {
      await sendVerificationEmail({ to: normalizedEmail, code });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw new Error(err.message || 'Failed to send verification email');
    }

    return { email: normalizedEmail };
  },

  async verifyEmail(_, { email, code }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await isCorrectVerificationCode(user, code))) {
      throw new Error('Invalid or expired verification code');
    }

    user.emailVerifiedAt = new Date();
    clearVerificationCode(user);
    await user.save();

    const token = signToken(user);
    return { token, user: user.toObject() };
  },

  async resendVerificationEmail(_, { email }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    // Avoid email enumeration: always succeed from the client's perspective.
    if (user && !isEmailVerified(user)) {
      const code = await assignVerificationCode(user);
      await user.save();
      try {
        await sendVerificationEmail({ to: normalizedEmail, code });
      } catch (err) {
        throw new Error(err.message || 'Failed to send verification email');
      }
    }

    return true;
  },

  async updateMe(_, { name }, { orgId }) {
    if (!orgId) {
      throw new Error('Unauthorized');
    }
    const user = await User.findById(orgId);
    if (!user) {
      throw new Error('Unauthorized');
    }
    if (name !== undefined && name !== null) {
      user.name = String(name).trim();
    }
    await user.save();
    return user.toObject();
  },

  async changePassword(_, { currentPassword, newPassword }, { orgId }) {
    if (!orgId) {
      throw new Error('Unauthorized');
    }
    assertPassword(newPassword);
    const user = await User.findById(orgId);
    if (!user) {
      throw new Error('Unauthorized');
    }
    if (!(await user.isCorrectPassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    return true;
  },
};

export default { Query, Mutation };
