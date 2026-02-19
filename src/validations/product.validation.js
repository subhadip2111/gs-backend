const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
    body: Joi.object().keys({
        sku: Joi.string().required(),
        name: Joi.string().required(),
        brand: Joi.string().required(),
        category: Joi.string().required().valid('Men', 'Women', 'Kids', 'Accessories'),
        subcategory: Joi.string().required(),
        price: Joi.number().required(),
        originalPrice: Joi.number(),
        description: Joi.string().required(),
        images: Joi.array().items(Joi.string()),
        sizes: Joi.array().items(Joi.string()),
        colors: Joi.array().items(Joi.string()),
        fabric: Joi.string(),
        specifications: Joi.array().items(Joi.string()),
        stock: Joi.object().pattern(Joi.string(), Joi.number()),
        isTrending: Joi.boolean(),
        isNewArrival: Joi.boolean(),
    }),
};

const getProducts = {
    query: Joi.object().keys({
        category: Joi.string(),
        subcategory: Joi.string(),
        isTrending: Joi.boolean(),
        isNewArrival: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getProduct = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId),
    }),
};

const updateProduct = {
    params: Joi.object().keys({
        productId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            sku: Joi.string(),
            name: Joi.string(),
            brand: Joi.string(),
            category: Joi.string().valid('Men', 'Women', 'Kids', 'Accessories'),
            subcategory: Joi.string(),
            price: Joi.number(),
            originalPrice: Joi.number(),
            description: Joi.string(),
            images: Joi.array().items(Joi.string()),
            sizes: Joi.array().items(Joi.string()),
            colors: Joi.array().items(Joi.string()),
            fabric: Joi.string(),
            specifications: Joi.array().items(Joi.string()),
            stock: Joi.object().pattern(Joi.string(), Joi.number()),
            isTrending: Joi.boolean(),
            isNewArrival: Joi.boolean(),
        })
        .min(1),
};

const deleteProduct = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
