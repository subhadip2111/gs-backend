const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addressBody = Joi.object().keys({
    label: Joi.string(),
    fullName: Joi.string().required(),
    mobile: Joi.string().required(),
    alternateMobile: Joi.string().allow(''),
    street: Joi.string().required(),
    village: Joi.string().allow(''),
    city: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().default('India'),
    isDefault: Joi.boolean(),
    altMobile: Joi.string().allow(''),
});

const addAddress = {
    body: addressBody,
};

const updateAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({
        label: Joi.string(),
        fullName: Joi.string(),
        mobile: Joi.string(),
        alternateMobile: Joi.string().allow(''),
        street: Joi.string(),
        village: Joi.string().allow(''),
        city: Joi.string(),
        pincode: Joi.string(),
        country: Joi.string(),
        isDefault: Joi.boolean(),
        altMobile: Joi.string().allow(''),

    }).min(1),
};

const deleteAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required().custom(objectId),
    }),
};

const setDefaultAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
