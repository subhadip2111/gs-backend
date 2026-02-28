const Joi = require('joi');
const { objectId } = require('./custom.validation');

const toggleWishlist = {
    body: Joi.object().keys({
        productId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    toggleWishlist,
};
