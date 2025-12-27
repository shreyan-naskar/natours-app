const express = require('express');

const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const {
  getOne,
  deleteOne,
  updateOne,
  createOne,
  getAll,
} = require('../utils/handlerFactory');

const getAllReviews = getAll(Review);

// middleware before createReview
const setTourUserIds = (req, res, next) => {
  // to allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // user loggin in so we get id, set by protect middleware
  next();
};

const createReview = createOne(Review);
const getReview = getOne(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};
