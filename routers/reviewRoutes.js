const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');
const protect = require('../middlewares/protectRoutes');
const restrictUsers = require('../middlewares/restrictUsers');

// mergeParams: get params from tourRouter if req redirected from there
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictUsers('user'), setTourUserIds, createReview); // only logged in 'user' can create reviews

router
  .route('/:id')
  .get(protect, restrictUsers('user'), getReview) // only logged in user can get their review
  .patch(protect, restrictUsers('user'), updateReview) // only logged in 'user' can update reviews
  .delete(protect, restrictUsers('user'), deleteReview); // only logged in 'user' can delete reviews
module.exports = router;
