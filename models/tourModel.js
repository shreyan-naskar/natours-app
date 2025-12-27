const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON for geospacial data: embedded object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, // day when people will visit this location
      },
    ],
    // child reference to users with roles - 'guides'
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], // guide_id array
  },
  // converted to plain JavaScript objects when you send JSON response
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// add custom indexes
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 for asc; -1 for desc
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate tours with reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id', // matched to _id
  foreignField: 'tour', // tour that review belongs to
});

// PRE QUERY MIDDLEWARES
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
});

// save guide objects in the guide array
// tourSchema.pre('save', async function () {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // map func returns promises
//   this.guides = await Promise.all(guidesPromises); // wait for all promises to be resolved
// });
// DO NOT EMBED GUIDES => IF ANY UPDATE IN GUIDE OBJ => CHANGE ALL TOURS THEY ARE INVOLVED IN => BAD

// fill up the guides field using the objectId reference
// during query execution, not stored in db
tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // no need to show these, so deselect
  });
});

// POST QUERY MIDDLEWARES
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
});

module.exports = mongoose.model('Tour', tourSchema);
