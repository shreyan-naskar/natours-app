const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    // parent referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User.'],
    },
  },
  // converted to plain JavaScript objects when you send JSON response
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// PRE QUERY MIDDLEWARES

// fill up the guides field using the objectId reference
// during query execution, not stored in db
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo', // send only name & photo, no pvt data
  });
  // chaining of populates: tour -> review - > tour => not ideal
  //   this.populate({
  //     path: 'tour',
  //     select: 'name', // send only name, no pvt data
  //   });
});
module.exports = mongoose.model('Review', reviewSchema);
