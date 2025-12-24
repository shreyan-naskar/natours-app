const User = require('./../models/userModel');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const jwt = require('jsonwebtoken');

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
module.exports = {
  signUp,
  login,
};
