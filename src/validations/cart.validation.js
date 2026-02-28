const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
    body: Joi.object().keys({
        productId: Joi.string().required().custom(objectId),
        quantity: Joi.number().integer().min(1).default(1),
        color: Joi.string().allow(''),
        size: Joi.string().allow(''),
    }),
};

const updateCartItem = {
    params: Joi.object().keys({
        itemId: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({
        quantity: Joi.number().integer().min(1).required(),
    }),
};

const removeFromCart = {
    params: Joi.object().keys({
        itemId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    addToCart,
    updateCartItem,
    removeFromCart,
};
