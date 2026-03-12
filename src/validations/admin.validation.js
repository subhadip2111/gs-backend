const Joi = require('joi');

const getUsersByCategory = {
    query: Joi.object().keys({
        type: Joi.string().required().valid('new', 'premium', 'old', 'all'),
        startDate: Joi.date(),
        endDate: Joi.date(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        keyword: Joi.string().allow(''),
    }),
};

module.exports = {
    getUsersByCategory,
};
