const mongoose = require('mongoose');
const Tour = require('./tourModel');
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

// set indexes
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.pre(/^findOneAnd/, async function () {
  // just to enforce recalc of avgRating
  // save as this.r to get tourId in post middleware
  this.passData = await this.findOne();
  // console.log(this.passData);
});

// calculate avg ratings
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// calculate avg rating after reviews are created, updated or deleted
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// recalc avg using this.passData set in pre middleware
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  // tourId saved in this.passData from pre middleware
  await this.passData.constructor.calcAverageRatings(this.r.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
