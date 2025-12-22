const User = require('./../models/userModel');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');

const signUp = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  if (!newUser) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Validation error.');
  }
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

module.exports = {
  signUp,
};
