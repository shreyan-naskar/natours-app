const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

// authentication and authorization
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const protect = require('../middlewares/protectRoutes');
const restrictUsers = require('../middlewares/restrictUsers');

const router = express.Router();
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword); // password update after login
router.patch('/updateMe', protect, updateMe); // update user data by logged in user
router.delete('/deleteMe', protect, deleteMe); // update user data by logged in user

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(protect, restrictUsers('admin'), updateUser) // only admin can update users(not password) using this route
  .delete(protect, restrictUsers('admin'), deleteUser); // only admin can delete users using this route

module.exports = router;
