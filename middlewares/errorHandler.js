// const { constants } = require('../constants');

// // custom error handlers
// const errorHandler = (err, req, res, next) => {
//   const statusCode = res.statusCode ? res.statusCode : 500;
//   switch (statusCode) {
//     case constants.VALIDATION_ERROR:
//       res.json({
//         title: 'Validation Failed',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;

//     case constants.NOT_FOUND:
//       res.json({
//         title: 'Not Found',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;

//     case constants.UNAUTHORIZED:
//       res.json({
//         title: 'Unauthorized',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;

//     case constants.FORBIDDEN:
//       res.json({
//         title: 'Forbidden',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;

//     case constants.SERVER_ERROR:
//       res.json({
//         title: 'Server Error',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;

//     default:
//       // console.log('No Error, all good', statusCode, err.stack);
//       res.json({
//         title: 'Unknown Error',
//         message: err.message,
//         stackTrace: err.stack,
//       });
//       break;
//   }
// };

// module.exports = errorHandler;

const { constants } = require('../constants');

// custom error handlers
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  let title, message, stackTrace;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      title = 'Validation Failed';
      message = err.message;
      stackTrace = err.stack;
      break;

    case constants.NOT_FOUND:
      title = 'Not Found';
      message = err.message;
      stackTrace = err.stack;
      break;

    case constants.UNAUTHORIZED:
      title = 'Unauthorized';
      message = err.message;
      stackTrace = err.stack;
      break;

    case constants.FORBIDDEN:
      title = 'Forbidden';
      message = err.message;
      stackTrace = err.stack;
      break;

    case constants.SERVER_ERROR:
      title = 'Server Error';
      message = err.message;
      stackTrace = err.stack;
      break;

    default:
      title = 'Unknown Error';
      message = err.message;
      stackTrace = err.stack;
      break;
  }
  if (process.env.NODE_ENV === 'development') {
    res.json({
      title,
      message,
      stackTrace,
    });
  } else if (process.env.NODE_ENV === 'production') {
    console.log(
      `Title: ${title}\nMessage: ${message}\nstackTrace: ${stackTrace}`,
    );
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = errorHandler;
