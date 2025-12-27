const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const protect = require('../middlewares/protectRoutes');
const restrictUsers = require('../middlewares/restrictUsers');

// mergeParams: get params from tourRouter if req redirected from there
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictUsers('user'), createReview); // logged in 'user' can only create reviews

router.route('/:id').delete(protect, restrictUsers('user'), deleteReview); // logged in 'user' can only delete reviews
module.exports = router;
