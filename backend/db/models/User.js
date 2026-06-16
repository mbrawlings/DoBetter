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
  },
  { timestamps: true }
);

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
