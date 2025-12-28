const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const viewRouter = require('./routers/viewRouter');
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');
const hpp = require('hpp');

const app = express();

// server-side rendering: use pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // directory from where views will be generated
app.use(express.static(path.join(__dirname, 'public'))); // serve statics

// GLOBAL MIDDLEWARES
// security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cookieParser()); // to read from cookies
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

// ROUTER MIDDLEWARES
// view
app.use('/', viewRouter);

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
