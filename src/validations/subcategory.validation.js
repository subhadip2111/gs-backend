const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSubCategory = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        category: Joi.string().custom(objectId).required(),
    }),
};

const getSubCategories = {
    query: Joi.object().keys({
        name: Joi.string(),
        category: Joi.string().custom(objectId),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getSubCategory = {
    params: Joi.object().keys({
        subCategoryId: Joi.string().custom(objectId).required(),
    }),
};

const updateSubCategory = {
    params: Joi.object().keys({
        subCategoryId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            category: Joi.string().custom(objectId),
        })
        .min(1),
};

const deleteSubCategory = {
    params: Joi.object().keys({
        subCategoryId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createSubCategory,
    getSubCategories,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory,
};
