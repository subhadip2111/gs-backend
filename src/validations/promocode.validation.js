const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPromoCode = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.number().required(),
    minOrderAmount: Joi.number().required(),
    maxDiscountAmount: Joi.number().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    isActive: Joi.boolean(),
    usageLimit: Joi.number().required(),
    userType: Joi.string().valid('newUser', 'regular_user', 'frequent_user', 'prime_user', 'inactive_user','all'),
    users: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

const getPromoCodes = {
  query: Joi.object().keys({
    code: Joi.string().optional().allow(''),
    isActive: Joi.boolean().optional().allow(''),
    sortBy: Joi.string().optional().allow(''),
    limit: Joi.number().integer().optional().allow(''),
    page: Joi.number().integer().optional().allow(''),
    search: Joi.string().optional().allow(''),

  }),
};

const getPromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().custom(objectId),
  }),
};

const updatePromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      code: Joi.string(),
      discountType: Joi.string().valid('percentage', 'fixed'),
      discountValue: Joi.number(),
      minOrderAmount: Joi.number(),
      maxDiscountAmount: Joi.number(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      isActive: Joi.boolean(),
      usageLimit: Joi.number(),
    userType: Joi.string().valid('newUser', 'regular_user', 'frequent_user', 'prime_user', 'inactive_user','all'),
      users: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deletePromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
};
