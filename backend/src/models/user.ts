import mongoose = require('mongoose');
const pwdLM = require('passport-local-mongoose');
const passport = require('passport');

const UserSchema = new mongoose.Schema({
  registerDate: Date,
  email: {
    required: true,
    type: String,
    unique: true,
  }
})

UserSchema.plugin(pwdLM);

const User = mongoose.model('user', UserSchema);

//@ts-ignore
passport.use(User.createStrategy());

export = User;


