const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

// authentication and authorization
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} = require('../controllers/authController');

const protect = require('../middlewares/protectRoutes');
const restrictUsers = require('../middlewares/restrictUsers');

const router = express.Router();
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// user needs to login
router.use(protect);
router.patch('/updateMyPassword', updatePassword); // password update after login
// add photo for usr profile; 'photo' field of form where photo is uploaded; single for 1 image
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe); // update user data by logged in user
router.delete('/deleteMe', deleteMe); // update user data by logged in user

// only logged in admin can acesss
router.use(restrictUsers('admin'));
router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser) // only admin can update users(not password) using this route
  .delete(deleteUser); // only admin can delete users using this route

module.exports = router;
