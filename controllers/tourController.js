const express = require('express');

const Tour = require('../models/tourModel');
const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const {
  getOne,
  deleteOne,
  updateOne,
  createOne,
  getAll,
} = require('../utils/handlerFactory');

//@desc Get all tours
//@route GET /api/v1/tours
//@access public
const getAllTours = getAll(Tour);

//@desc Get a tour
//@route GET /api/v1/tours/:id
//@access public
const getTour = getOne(Tour, { path: 'reviews' });

//@desc Create a tour
//@route POST /api/v1/tours
//@access private
const createTour = createOne(Tour);

//@desc Update a tour
//@route PATCH /api/v1/tours/:id
//@access private
const updateTour = updateOne(Tour);

//@desc Delete a tour
//@route DELETE /api/v1/tours/:id
//@access private
const deleteTour = deleteOne(Tour);

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
//@access private
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

//@desc Get all tours withing a distance of a given location
//@route GET /api/v1/tours/tour-within/:distance/center/:latlng/unit/:unit
//@access private
const getToursWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error(
      'Please provide latitute and longitude in the format lat,lng.',
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//@desc Get all tours withing a distance of a given location
//@route GET /api/v1/tours/distances/:latlng/unit/:unit
//@access private
const getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error(
      'Please provide latitutr and longitude in the format lat,lng.',
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // convert to numbers from str
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
};
