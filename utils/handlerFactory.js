const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
const APIFeatures = require('../utils/apiFeatures');

const getAll = (Model) =>
  asyncHandler(async (req, res) => {
    // filter to use only reviews of tourId if mentioned
    // for nested route: /api/v1/tours/:toursId/reviews
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });

const getOne = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id); // virtual populate the reviews
    if (populateOptions) {
      query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      res.status(constants.NOT_FOUND);
      throw new Error('No document found with that ID');
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// returns controller function for any given doc eg. tours, users, reviews
const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(constants.NOT_FOUND);
      throw new Error('No document found with that ID');
    }
    res.status(204).json({
      status: 'success',
    });
  });

const updateOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      res.status(constants.NOT_FOUND);
      throw new Error('No document found with that ID');
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newDoc,
      },
    });
  });

module.exports = { getAll, getOne, deleteOne, updateOne, createOne };
