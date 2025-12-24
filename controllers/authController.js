const User = require('./../models/userModel');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/email');

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

const signUp = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
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

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Email and password should be non-empty.');
  }

  const user = await User.findOne({ email }).select('+password');
  // if no user exists or passwords mismatched
  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(constants.UNAUTHORIZED);
    throw new Error(`Incorrect email or password.`);
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

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
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent.');
  }
});

const resetPassword = (req, res, next) => {};

module.exports = {
  signUp,
  login,
  forgotPassword,
  resetPassword,
};
