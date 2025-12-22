const { constants } = require('../constants');

// custom error handlers
const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode * 1 > 400 && res.statusCode * 1 < 500 ? res.statusCode : 500;
  let title;
  let status = 'fail';
  let message = err.message;
  const stackTrace = err.stack;

  // mongoose errors
  if (err.name === 'CastError') {
    title = err.name;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    title = 'DuplicateFileds';
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(value);
    message = `Duplicate field value: ${value}. Please use another value!`;
  } else if (err.name === 'ValidationError') {
    title = err.name;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Invalid input data. ${errors.join('. ')}`;
  } else {
    // error thrown from code
    switch (statusCode) {
      case constants.VALIDATION_ERROR:
        title = 'Validation Failed';
        break;

      case constants.NOT_FOUND:
        title = 'Not Found';
        break;

      case constants.UNAUTHORIZED:
        title = 'Unauthorized';
        break;

      case constants.FORBIDDEN:
        title = 'Forbidden';
        break;

      case constants.SERVER_ERROR:
        title = 'Server Error';
        break;
      // everything else
      default:
        title = 'Unknown Error';
        break;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode);
    res.json({
      status,
      title,
      message,
      stackTrace,
      // err,
    });
  } else if (process.env.NODE_ENV === 'production') {
    console.log(
      `Title: ${title}\nMessage: ${message}\nstackTrace: ${stackTrace}`,
    );
    res.status(500).json({
      status,
      message: 'Something went very wrong!',
    });
  }
};

module.exports = errorHandler;
