const express = require('express');
const asyncHandler = require('express-async-handler');

const { constants } = require('../constants');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('../utils/handlerFactory');

const filterObj = function (obj, ...allowedFields) {
  const newObj = {};
  // create new obj with only the allowed fields
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getAllUsers = getAll(User);

const updateMe = asyncHandler(async (req, res, next) => {
  // create error if user tries to updatepassword
  if (req.body.password || req.body.passwordConfirm) {
    res.status(constants.UNAUTHORIZED);
    throw new Error('Use /updateMyPassword for password updates.');
  }

  // fileter req body, donot let user change sensitive data like role etc
  const filteredBody = filterObj(req.body, 'name', 'email');
  // update user doc
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getUser = getOne(User);

const createUser = asyncHandler(async (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined. Please use /signUp.',
  });
});

// do not update passwords here
const updateUser = updateOne(User);

const deleteUser = deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
