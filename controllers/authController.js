const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { constants } = require('../constants');
const User = require('./../models/userModel');
const sendMail = require('../utils/email');

// sign jwt token
const signToken = (id) => {
  return jwt.sign(
    // payload
    {
      id: id,
    },
    // secret
    process.env.JWT_SECRET,
    // JWT TTL
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

//@desc User Sign up
//@route GET /api/v1/users/signup
//@access public
const signUp = asyncHandler(async (req, res, next) => {
  // create new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  if (!newUser) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Validation error.');
  }
  // log user in, send jwt
  createAndSendToken(newUser, 201, res);
});

//@desc User Login
//@route GET /api/v1/users/login
//@access public
const login = asyncHandler(async (req, res, next) => {
  // get login credentials
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Email and password should be non-empty.');
  }

  // get user
  const user = await User.findOne({ email }).select('+password');
  // if no user exists or passwords mismatched
  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(constants.UNAUTHORIZED);
    throw new Error(`Incorrect email or password.`);
  }

  // log user in, send jwt
  createAndSendToken(user, 200, res);
});

//@desc User Forgot Password
//@route GET /api/v1/users/forgotPassword
//@access public
const forgotPassword = asyncHandler(async (req, res, next) => {
  // get used based on given email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(constants.NOT_FOUND);
    throw new Error('No user found.');
  }

  // generate random reset token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false }); // save the generated hashed reset-token

  // send to users email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const msg = `Forgot password? Tap on this link to set new password: ${resetURL}.\n
  If you did'nt forget your passwprd, please ignore this email!`;

  try {
    // send email
    await sendMail({
      email: user.email,
      subject: 'Your password reset token. (valid for 10 mins)',
      message: msg,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
      token: resetToken,
    });
  } catch (err) {
    // undo the reset token info saved
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent.');
  }
});

//@desc User Reset Password
//@route GET /api/v1/users/resetPassword
//@access public
const resetPassword = asyncHandler(async (req, res, next) => {
  // get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }, // check if token has expired
  });

  // set new password if token not expired
  if (!user) {
    res.status(constants.NOT_FOUND);
    throw new Error('Token is invalid or has expired!');
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save();

  // update changedPasswordAt
  // user;
  // log the user in, send jwt
  createAndSendToken(user, 200, res);
});

//@desc User Update Password
//@route GET /api/v1/users/updatePassword
//@access public
const updatePassword = asyncHandler(async (req, res, next) => {
  // get user
  //user is logged in so req contains user object
  const user = await User.findById(req.user.id).select('+password');
  // check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.status(constants.UNAUTHORIZED);
    throw new Error('Password incorrect');
  }

  // update password if correct
  // don't user findByIdAndUpdate as we want validation to work
  // validation works only on save
  // save also sets the pre save middlewares: hashing and changed timestamp
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // login user, send jwt
  createAndSendToken(user, 200, res);
});
module.exports = {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
};
