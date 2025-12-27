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

// only for logged in user
router.use(protect); // login

router
  .route('/')
  .get(getAllReviews)
  .post(restrictUsers('user', 'admin'), setTourUserIds, createReview); // only logged in 'user' can create reviews

router
  .route('/:id')
  .get(getReview) // only logged in user can get their review
  .patch(restrictUsers('user', 'admin'), updateReview) // only logged in 'user' can update reviews
  .delete(restrictUsers('user', 'admin'), deleteReview); // only logged in 'user' can delete reviews
module.exports = router;
