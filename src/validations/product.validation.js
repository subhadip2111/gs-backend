const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
    body: Joi.object().keys({
        sku: Joi.string().required(),
        name: Joi.string().required(),
        brand: Joi.string().required(),
        category: Joi.string().custom(objectId).required(),
        subcategory: Joi.string().custom(objectId).required(),
        price: Joi.number().required(),
        originalPrice: Joi.number(),
        description: Joi.string().required(),
        images: Joi.array().items(Joi.string()),
        variants: Joi.array().items(
            Joi.object().keys({
                color: Joi.object().keys({
                    name: Joi.string().required(),
                    hex: Joi.string().required(),
                }).required(),
                sizes: Joi.array().items(
                    Joi.object().keys({
                        size: Joi.string().required(),
                        quantity: Joi.number().integer().min(0).required(),
                    })
                ),
            })
        ),
        fabric: Joi.string(),
        specifications: Joi.array().items(Joi.string()),
        isTrending: Joi.boolean(),
        isNewArrival: Joi.boolean(),
        materialAndCare: Joi.array().items(Joi.string()),
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
            category: Joi.string().custom(objectId),
            subcategory: Joi.string().custom(objectId),
            price: Joi.number(),
            originalPrice: Joi.number(),
            description: Joi.string(),
            images: Joi.array().items(Joi.string()),
            variants: Joi.array().items(
                Joi.object().keys({
                    color: Joi.object().keys({
                        name: Joi.string().required(),
                        hex: Joi.string().required(),
                    }).required(),
                    sizes: Joi.array().items(
                        Joi.object().keys({
                            size: Joi.string().required(),
                            quantity: Joi.number().integer().min(0).required(),
                        })
                    ),
                })
            ),
            fabric: Joi.string(),
            specifications: Joi.array().items(Joi.string()),
            isTrending: Joi.boolean(),
            isNewArrival: Joi.boolean(),
            materialAndCare: Joi.array().items(Joi.string()),
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
