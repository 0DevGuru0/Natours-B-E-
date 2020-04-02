const Tour = require('./../models/toursModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      } //The $match  stage filters the doc by the ratingAverage filed ane proccess the next stage those doc that have ratingsAverage gte 4.5
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty'
        }, // whit this element we can make a category with difficulty property
        numTours: {
          $sum: 1
        }, // this one add one to each documents
        numRting: {
          $sum: '$ratingsQuantity'
        },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        avgPrice: {
          $avg: '$price'
        },
        minPrice: {
          $min: '$price'
        },
        maxPrice: {
          $max: '$price'
        }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //Deconstructs an array field from the input documents to output a document for each element. Each output document is the input document with the value of the array field replaced by the element.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: '$startDates'
        },
        numTourStats: {
          $sum: 1
        },
        tours: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: {
        // Add  new fields
        month: '$_id'
      }
    },
    {
      $project: {
        //The $project takes a document that can specify the inclusion of fields, the suppression of the _id field, the addition of new fields, and the resetting of the values of existing fields. Alternatively, you may specify the exclusion of fields.
        _id: 0
      }
    },
    {
      $sort: {
        numTourStats: -1
      }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: {
      plan
    }
  });
});

// tours-whithin/233/center/30.055173,-118.303495/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiPlier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiPlier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  console.log(distances);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
