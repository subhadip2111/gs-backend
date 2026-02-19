const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
    body: Joi.object().keys({
        items: Joi.array().items(
            Joi.object().keys({
                product: Joi.string().custom(objectId).required(),
                quantity: Joi.number().required().min(1),
                selectedSize: Joi.string(),
                selectedColor: Joi.string(),
                priceAtPurchase: Joi.number(),
            })
        ).required().min(1),
        shippingAddress: Joi.object().keys({
            fullName: Joi.string().required(),
            mobile: Joi.string().required(),
            street: Joi.string().required(),
            village: Joi.string(),
            city: Joi.string().required(),
            pincode: Joi.string().required(),
            country: Joi.string(),
        }).required(),
        paymentMethod: Joi.string().valid('COD', 'Prepaid'),
        appliedCoupon: Joi.string(),
        discountAmount: Joi.number(),
    }),
};

const getOrders = {
    query: Joi.object().keys({
        status: Joi.string().valid('Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
        user: Joi.string().custom(objectId),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getOrder = {
    params: Joi.object().keys({
        orderId: Joi.string().custom(objectId),
    }),
};

const updateOrderStatus = {
    params: Joi.object().keys({
        orderId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        status: Joi.string().required().valid('Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    }),
};

const cancelOrder = {
    params: Joi.object().keys({
        orderId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
};
