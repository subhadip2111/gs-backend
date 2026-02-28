const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBrand = {
    body: Joi.object().keys({
        name: Joi.string().required(),
    }),
};

const getBrands = {
    query: Joi.object().keys({
        name: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getBrand = {
    params: Joi.object().keys({
        brandId: Joi.string().custom(objectId).required(),
    }),
};

const updateBrand = {
    params: Joi.object().keys({
        brandId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
        })
        .min(1),
};

const deleteBrand = {
    params: Joi.object().keys({
        brandId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createBrand,
    getBrands,
    getBrand,
    updateBrand,
    deleteBrand,
};
