const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');
const protect = require('../middlewares/protectRoutes');
const restrictUsers = require('../middlewares/restrictUsers');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictUsers('user'), createReview); // logged in 'user' can only create reviews

module.exports = router;
