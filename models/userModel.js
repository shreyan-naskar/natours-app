const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
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
  passwordChangedAt: Date, // last time password was reset
  passwordResetToken: String, // reset token for comparison
  passwordResetExpired: Date, // reset token expiry time
  // check user has acc or deleted
  active: {
    type: Boolean,
    default: true,
    select: false, // do not show in response
  },
});

// User getAllUsers: do not use inactive/deleted users
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

// User SignUp: hash password before storing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // do not save after validation
});

// User updatePassword: save change time of password
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) {
    return;
  }
  // sometimes jwt may get issued before the db save of pasword change, thus jwt would be invalid
  this.passwordChangedAt = Date.now() - 1000; // hence substract 1 sec
});

// User Login: compare the passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// JWT verification: to check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // change into seconds from Date object
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimestamp; // true: changed; false; not changed
  }
  return false; // not changed
};

// password reset: generate a random reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // random reset-token
  this.passwordResetToken = crypto // save encrypted version of reset token for future verification
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000; //10mins in ms
  return resetToken; // send raw reset token
};

module.exports = mongoose.model('User', userSchema);
