const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBanner = {
    body: Joi.object().keys({
        type: Joi.string().valid('banner', 'popup', 'sidebar','brands').default('banner'),
        imageUrl: Joi.string().uri().optional(),
        title: Joi.string().required(),
        subtitle: Joi.string(),
        description: Joi.string(),
        ctaText: Joi.string(),
        ctaLink: Joi.string(),
        // make it value as optional
        brands: Joi.array().items({
            name: Joi.string().required(),
            imageUrl: Joi.string().uri().required(),
            description: Joi.string(),
            link: Joi.string(),
            tagline: Joi.string(),
        }).optional(),
        secondaryCtaText: Joi.string(),
        secondaryCtaLink: Joi.string(),
        badge: Joi.string(),
        isActive: Joi.boolean(),
        status: Joi.string().valid('active', 'inactive').default('active'),
    }),
};

const getBanners = {
    query: Joi.object().keys({
        type: Joi.string().valid('banner', 'popup', 'sidebar'),
        isActive: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getBanner = {
    params: Joi.object().keys({
        bannerId: Joi.string().custom(objectId).required(),
    }),
};

const updateBanner = {
    params: Joi.object().keys({
        bannerId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            type: Joi.string().valid('banner', 'popup', 'sidebar'),
            imageUrl: Joi.string().uri(),
            title: Joi.string(),
            subtitle: Joi.string(),
            description: Joi.string(),
            ctaText: Joi.string(),
            ctaLink: Joi.string(),
            secondaryCtaText: Joi.string(),
            secondaryCtaLink: Joi.string(),
            badge: Joi.string(),
            isActive: Joi.boolean(),
            order: Joi.number().integer(),
        })
        .min(1),
};

const deleteBanner = {
    params: Joi.object().keys({
        bannerId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createBanner,
    getBanners,
    getBanner,
    updateBanner,
    deleteBanner,
};
