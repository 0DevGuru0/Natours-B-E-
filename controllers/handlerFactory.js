const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      //204 means no content
      status: 'success',
      data: null
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //bool-true  to return the modified document rather than the originals.defaults to false
      runValidators: true //if true , runs update validators on this command , Update validators validate the update operation against  the model's schema
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    // console.log(req.params);
    // const id = req.params.id * 1;
    //   const tour = tours.find(el => el.id === id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nasted GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXCUTE QUERY
    const feature = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate();
    // const doc = await feature.query.explain();
    const doc = await feature.query;

    // console.log(req.query);
    // console.log(queryOBJ);

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    //  SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
