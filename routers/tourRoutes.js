const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const protect = require('../middlewares/protectRoutes');
const aliasTopTours = require('../middlewares/aliasTopTours');
const restrictUsers = require('../middlewares/restrictUsers');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// nested route
// /tours/<some-tour-id>/reviews/ => redirect to reviewRoute for this
router.use('/:tourId/reviews', reviewRouter);

// alias tour
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictUsers('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// create, update and delete tour routes are authorization based
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictUsers('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictUsers('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictUsers('admin', 'lead-guide'), deleteTour);

module.exports = router;
