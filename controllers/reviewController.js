const express = require('express');

const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const { deleteOne } = require('../utils/handlerFactory');

const getAllReviews = asyncHandler(async (req, res, next) => {
  // filter to use only reviews of tourId if mentioned
  // for nested route: /api/v1/tours/:toursId/reviews
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);

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

// const deleteTour = asyncHandler(async (req, res) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     res.status(constants.NOT_FOUND);
//     throw new Error('No tour found with that ID');
//   }
//   res.status(204).json({
//     status: 'success',
//   });
// });

const deleteReview = deleteOne(Review);
module.exports = { getAllReviews, createReview, deleteReview };
