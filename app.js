const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const app = express();

// GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// ROUTER MIDDLEWARES
// Tours
app.use('/api/v1/tours', tourRouter);

// Users
app.use('/api/v1/users', userRouter);

module.exports = app;
