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
            })
        ).required().min(1),
        // Either addressId or shippingAddress must be provided — both optional here, enforced in controller
        addressId: Joi.string().custom(objectId),
        shippingAddress: Joi.object().keys({
            fullName: Joi.string().required(),
            mobile: Joi.string().required(),
            altMobile: Joi.string().allow(''),
            street: Joi.string().required(),
            village: Joi.string().allow(''),
            city: Joi.string().required(),
            pincode: Joi.string().required(),
            country: Joi.string(),
        }),
        paymentMethod: Joi.string().valid('COD', 'Prepaid').default('COD'),
        appliedCoupon: Joi.string(),
        discountAmount: Joi.number().default(0),
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
        deliveryDate: Joi.string(),
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
