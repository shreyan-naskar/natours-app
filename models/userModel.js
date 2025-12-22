const mongoose = require('mongoose');
const validator = require('validator');

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
    required: [true, 'A tour must have a name'],
    minLength: [8, 'A password name must have atleast 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A tour must have a name'],
  },
});

module.exports = mongoose.model('User', userSchema);
