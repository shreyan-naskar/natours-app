const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { constants } = require('../constants');
const { promisify } = require('util');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  // get token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(constants.UNAUTHORIZED);
    throw new Error('You are not logged in.');
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  // jwt used is valid and not expired but user is deleted in the meantime
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    res.status(constants.NOT_FOUND);
    throw new Error('User belonging to this token no longer exists.');
  }

  // check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    res.status(constants.UNAUTHORIZED);
    throw new Error('User recently changed password. Please login again.');
  }
  // all ok - grant access to protected routes
  req.user = currentUser;
  next();
});

module.exports = { protect };
