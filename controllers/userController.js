const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

// store to local storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-userID-time.jpg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// but we first store to memory for some processing
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image!'), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const asyncHandler = require('express-async-handler');

const { constants } = require('../constants');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('../utils/handlerFactory');

const filterObj = function (obj, ...allowedFields) {
  const newObj = {};
  // create new obj with only the allowed fields
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getAllUsers = getAll(User);

const updateMe = asyncHandler(async (req, res, next) => {
  // console.log(req.file);
  // create error if user tries to updatepassword
  if (req.body.password || req.body.passwordConfirm) {
    res.status(constants.UNAUTHORIZED);
    throw new Error('Use /updateMyPassword for password updates.');
  }

  // fileter req body, donot let user change sensitive data like role etc
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // update user doc
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // console.log(updatedUser);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getUser = getOne(User);

const createUser = asyncHandler(async (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined. Please use /signUp.',
  });
});

// do not update passwords here
const updateUser = updateOne(User);

const deleteUser = deleteOne(User);
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = (req, res, next) => {
  // console.log('Hello');
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // changed in shrp to be always jpeg

  sharp(req.file.buffer)
    .resize(500, 500) // crop to 500x500 has options; read docs
    .toFormat('jpeg') // save as jpeg
    .jpeg({ quality: 90 }) // degrade to 90%
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
