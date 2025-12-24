const { constants } = require('../constants');

// Authorization
const restrictUsers = (...roles) => {
  return (req, res, next) => {
    // can access roles as an array: [admin, lead-guide]
    if (!roles.includes(req.user.role)) {
      res.status(constants.FORBIDDEN);
      throw new Error('You are not authorized.');
    }
    next();
  };
};

module.exports = restrictUsers;
