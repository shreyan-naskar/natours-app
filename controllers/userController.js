const express = require('express');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

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
};
