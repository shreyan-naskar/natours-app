const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');
const hpp = require('hpp');

const app = express();

// GLOBAL MIDDLEWARES
// security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api', limiter); // rate limiter
app.use(express.json({ limit: '10kb' })); // body parser
app.use(mongoSanitize()); // data sanitization against NoSQL query injection
app.use(xss()); // data sanitization against xss
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsQuantity',
      'ratingsAverage',
    ],
  }),
); // prevent http parameter pollution
app.use(express.static(`${__dirname}/public`)); // serve statics

// ROUTER MIDDLEWARES
// Tours
app.use('/api/v1/tours', tourRouter);

// Users
app.use('/api/v1/users', userRouter);

// Reviews
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  res.status(404);
  throw new Error(`Can't find ${req.originalUrl} on this server!`);
});

// global error handling middleware
app.use(errorHandler);

module.exports = app;
