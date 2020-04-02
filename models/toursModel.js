const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        30,
        'A tour name must have less or equal then 30 characters.'
      ],
      minlength: [10, 'A tour must have more or equal then 10 characters.']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either :easy , medium , difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above  1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // THIS only points to current doc on NEW document creation
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    startDates: [Date]
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);
tourSchema.index({
  price: 1,
  ratingsAverage: -1
});
tourSchema.index({
  slug: 1
});
tourSchema.index({
  startLocation: '2dsphere'
});

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLWARE :runs before .save() and .create() , but never work for insertmany() or insertAndUpdate() ,...
tourSchema.pre('save', function(next) {
  console.log(this);
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// Embedding the tour guides
// tourSchema.pre('save', async function(next) {
//   const giudesPromise = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(giudesPromise);
//   next();
// });

// tourSchema.post('save' , function(doc , next){
//   console.log(doc);
//   next();
// })

// Query MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({
    secretTour: {
      $ne: true
    }
  });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds!`);
  next();
});

// AGGREGATE MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: {
//         $ne: true
//       }
//     }
//   });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
