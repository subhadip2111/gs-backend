const httpStatus = require('http-status');
const { PlatformReview } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a platform review
 * @param {Object} reviewBody
 * @returns {Promise<PlatformReview>}
 */
const createPlatformReview = async (reviewBody) => {
  return PlatformReview.create(reviewBody);
};

/**
 * Query for platform reviews
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPlatformReviews = async (filter, options) => {
  const reviews = await PlatformReview.paginate(filter, options);
  return reviews;
};

/**
 * Delete platform review by id
 * @param {ObjectId} reviewId
 * @returns {Promise<PlatformReview>}
 */
const deletePlatformReviewById = async (reviewId) => {
  const review = await PlatformReview.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Platform Review not found');
  }
  await review.remove();
  return review;
};

module.exports = {
  createPlatformReview,
  queryPlatformReviews,
  deletePlatformReviewById,
};
