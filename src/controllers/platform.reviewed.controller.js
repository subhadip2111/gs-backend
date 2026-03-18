const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { platformReviewService } = require('../services');

const createPlatformReview = catchAsync(async (req, res) => {
  const reviewBody = {
    ...req.body,
    user: req.user.id,
  };
  const review = await platformReviewService.createPlatformReview(reviewBody);
  res.status(httpStatus.CREATED).send(review);
});

const getPlatformReviews = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['platform']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await platformReviewService.queryPlatformReviews(filter, options);
  res.send(result);
});

const deletePlatformReview = catchAsync(async (req, res) => {
  await platformReviewService.deletePlatformReviewById(req.params.reviewId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPlatformReview,
  getPlatformReviews,
  deletePlatformReview,
};
