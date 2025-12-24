const { constants } = require('../constants');

// custom error handlers
const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode * 1 > 400 && res.statusCode * 1 < 500 ? res.statusCode : 500;
  let name;
  let status = 'fail';
  let message = err.message;
  const stackTrace = err.stack;

  // mongoose errors
  // CastError
  if (err.name === 'CastError') {
    name = err.name;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Duplicate Fields
  else if (err.code === 11000) {
    name = 'DuplicateFileds';
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(value);
    message = `Duplicate field value: ${value}. Please use another value!`;
  }
  // Validation Error
  else if (err.name === 'ValidationError') {
    name = err.name;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Invalid input data. ${errors.join('. ')}`;
  }
  // JWT error
  else if (err.name === 'JsonWebTokenError') {
    statusCode = constants.UNAUTHORIZED;
    name = err.name;
    message = 'Invalid token. Please login again.';
  }
  // JWT token expired
  else if (err.name === 'TokenExpiredError') {
    statusCode = constants.UNAUTHORIZED;
    name = err.name;
    message = 'Token expired. Please login again.';
  }
  // error thrown from code
  else {
    switch (statusCode) {
      case constants.VALIDATION_ERROR:
        name = err.name || 'Validation Failed';
        break;

      case constants.NOT_FOUND:
        name = err.name || 'Not Found';
        break;

      case constants.UNAUTHORIZED:
        name = err.name || 'Unauthorized';
        break;

      case constants.FORBIDDEN:
        name = err.name || 'Forbidden';
        break;

      case constants.SERVER_ERROR:
        name = err.name || 'Server Error';
        break;
      // random unknown eror
      default:
        name = err.name || 'Unknown Error';
        break;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode);
    res.json({
      status,
      name,
      message,
      stackTrace,
      // err,
    });
  } else if (process.env.NODE_ENV === 'production') {
    console.log(
      `Name: ${name}\nMessage: ${message}\nstackTrace: ${stackTrace}`,
    );
    res.status(statusCode).json({
      status,
      message: 'Something went very wrong!',
    });
  }
};

module.exports = errorHandler;
