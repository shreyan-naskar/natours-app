const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email.'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'password mandatory'],
    minLength: [8, 'A password name must have atleast 8 characters'],
  },
  passwordConfirm: {
    type: String,
    // works on SAVE/ CREATE only
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same.',
    },
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // do not save after validation
});

module.exports = mongoose.model('User', userSchema);
