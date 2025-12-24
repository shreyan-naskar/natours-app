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
const { protect } = require('../middlewares/protectRoutes');
const { aliasTopTours } = require('../middlewares/aliasTopTours');
const { restrictUsers } = require('../middlewares/restrictUsers');

const router = express.Router();

// alias tour
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.use(protect); // use jwt verification for protected routes
router.route('/').get(getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(restrictUsers('admin', 'lead-guide'), deleteTour);

module.exports = router;
