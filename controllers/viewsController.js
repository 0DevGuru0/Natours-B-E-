const Tour = require('../models/toursModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({
    slug: req.params.slug
  }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  // 2)Building template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account.'
  });
});

exports.getSignUpForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up with your new account.'
  });
});
