import User from '../../db/models/User.js';
import { signToken } from '../../utils/auth.js';

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
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.isCorrectPassword(password))) {
      throw new Error('Invalid email or password');
    }
    const token = signToken(user);
    return { token, user: user.toObject() };
  },
};

export default { Query, Mutation };
