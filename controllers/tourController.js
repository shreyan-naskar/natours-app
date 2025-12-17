const express = require('express');
const fs = require('fs');

// READ DATA
const data = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`);
const tours = JSON.parse(data);

const checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  if (val > tours.length) {
    return res.status(404).json({
      status: 'falied',
      message: 'failed',
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  const data = req.body;
  const { name, price } = data;
  if (!name || !price) {
    return res.status(404).json({
      status: 'failed',
      message: 'Missing params',
    });
  }
  next();
};

// ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour>',
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
};
