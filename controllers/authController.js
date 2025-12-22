const User = require('./../models/userModel');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const jwt = require('jsonwebtoken');

const signUp = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  if (!newUser) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Validation error.');
  }

  const token = jwt.sign(
    // payload
    {
      id: newUser._id,
    },
    // secret
    process.env.JWT_SECRET,
    // JWT TTL
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

module.exports = {
  signUp,
};
