// scripts/seedUser.mjs
// One-off script to create/update the single app user.
// Usage: SEED_EMAIL=you@example.com SEED_PASSWORD=secret NODE_ENV=development node scripts/seedUser.mjs
import '../db/connect.js';
import mongoose from 'mongoose';
import User from '../db/models/User.js';

const FIXED_ID = '000000000000000000000000';

const email = process.env.SEED_EMAIL;
const password = process.env.SEED_PASSWORD;
const name = process.env.SEED_NAME;

if (!email || !password) {
  console.error('SEED_EMAIL and SEED_PASSWORD must be set');
  await mongoose.disconnect();
  process.exit(1);
}

try {
  let user = await User.findById(FIXED_ID);
  if (!user) {
    user = new User({ _id: new mongoose.Types.ObjectId(FIXED_ID), email, password, name });
  } else {
    user.email = email;
    user.password = password; // re-hashed by pre-save hook
    if (name) user.name = name;
  }
  await user.save();
  console.log(`Seeded user ${user.email} (orgId ${FIXED_ID})`);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('Failed to seed user:', error.message);
  await mongoose.disconnect();
  process.exit(1);
}
