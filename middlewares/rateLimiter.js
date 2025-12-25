const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  max: 100, //max req per hr
  windowMs: 60 * 60 * 100, //1 hr
  message: 'Too many requests from this IP, please try again later!',
});

module.exports = limiter;
