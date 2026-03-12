const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { promoCodeService } = require('../services');

const createPromoCode = catchAsync(async (req, res) => {
  const promoCode = await promoCodeService.createPromoCode(req.body);
  res.status(httpStatus.CREATED).send(promoCode);
});

const getPromoCodes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'isActive', 'search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await promoCodeService.queryPromoCodes(filter, options);
  res.send(result);
});

const getPromoCode = catchAsync(async (req, res) => {
  const promoCode = await promoCodeService.getPromoCodeById(req.params.promoCodeId);
  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PromoCode not found');
  }
  res.send(promoCode);
});

const updatePromoCode = catchAsync(async (req, res) => {
  const promoCode = await promoCodeService.updatePromoCode(req.params.promoCodeId, req.body);
  res.send(promoCode);
});

const deletePromoCode = catchAsync(async (req, res) => {
  await promoCodeService.deletePromoCode(req.params.promoCodeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPromoCodeStats = catchAsync(async (req, res) => {
  const stats = await promoCodeService.getPromoCodeStats();
  res.send(stats);
});



const getPromocodesBasedOnUserType=catchAsync(async(req,res)=>{
    const result=await promoCodeService.getPromocodesBasedOnUserType(req.params.userId);
   return  res.send(result);
});
module.exports = {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeStats,
  getPromocodesBasedOnUserType
};
