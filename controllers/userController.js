const express = require('express');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

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

const getAllUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

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

const getUser = asyncHandler(async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
});

const createUser = asyncHandler(async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
});

const updateUser = asyncHandler(async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not defined',
  });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
};
