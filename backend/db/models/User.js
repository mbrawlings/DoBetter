// db/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const users = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationCodeHash: {
      type: String,
      default: null,
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
    },
    notificationPrefs: {
      enabled: { type: Boolean, default: false },
      leadDays: { type: Number, default: 1 },
      hour: { type: Number, default: 9 },
      minute: { type: Number, default: 0 },
      timeZone: { type: String, default: 'UTC' },
    },
    pushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true },
          p256dh: { type: String, required: true },
          auth: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

users.index({ 'notificationPrefs.enabled': 1 });

const bcryptRegex = /^\$2[ayb]\$.{56}$/;

users.pre('save', async function (next) {
  if (this.password && (this.isNew || this.isModified('password'))) {
    if (!bcryptRegex.test(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  next();
});

users.methods.isCorrectPassword = async function (password) {
  if (!password || !this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', users);

export default User;
