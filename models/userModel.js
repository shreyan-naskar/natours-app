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
    select: false,
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

// hash password before storing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // do not save after validation
});

// compare the passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
