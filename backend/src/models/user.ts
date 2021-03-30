import mongoose = require('mongoose');
const pwdLM = require('passport-local-mongoose');
const passport = require('passport');

const UserSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(pwdLM, {
  lastLoginField: 'lastLogin',
  limitAttempts: true,
  maxAttempts: 4,
});

const User = mongoose.model('user', UserSchema);

//@ts-ignore
passport.use(User.createStrategy());

export = User;


