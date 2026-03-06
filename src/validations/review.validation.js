const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
        images: Joi.array().items(Joi.string()),
    }),
};

const getReviews = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

module.exports = {
    createReview,
    getReviews,
};
