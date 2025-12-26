const express = require('express');

const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');

const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(300).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

const createReview = asyncHandler(async (req, res, next) => {
  // to allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // user loggin in so we get id, set by protect middleware
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.body.user,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
module.exports = { getAllReviews, createReview };
