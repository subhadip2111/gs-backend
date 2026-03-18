const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPlatformReview = {
  body: Joi.object().keys({
    review: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
    platform: Joi.string().required(),
  }),
};

const getPlatformReviews = {
  query: Joi.object().keys({
    platform: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deletePlatformReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPlatformReview,
  getPlatformReviews,
  deletePlatformReview,
};
