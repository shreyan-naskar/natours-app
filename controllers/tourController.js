const express = require('express');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');

//@desc Get top 5 cheapest tours amongst the highest rated
//@route GET /api/v1/tours/top-5-cheap
//@access public
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficult';
  next();
};

//@desc Get all tours
//@route GET /api/v1/tours
//@access public
const getAllTours = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//@desc Create a tour
//@route POST /api/v1/tours
//@access public
const createTour = asyncHandler(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//@desc Get a tour
//@route GET /api/v1/tours/:id
//@access public
const getTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    res.status(constants.NOT_FOUND);
    throw new Error('No tour found with that ID');
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//@desc Update a tour
//@route PATCH /api/v1/tours/:id
//@access public
const updateTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    res.status(constants.NOT_FOUND);
    throw new Error('No tour found with that ID');
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//@desc Delete a tour
//@route DELETE /api/v1/tours/:id
//@access public
const deleteTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    res.status(constants.NOT_FOUND);
    throw new Error('No tour found with that ID');
  }
  res.status(204).json({
    status: 'success',
  });
});

//@desc Get tour stats
//@route GET /api/v1/tours/tour-stats
//@access public
const getTourStats = asyncHandler(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

//@desc Get monthly tour plan
//@route GET /api/v1/tours/monthly-plan/:year
//@access public
const getMonthlyPlan = asyncHandler(async (req, res) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
