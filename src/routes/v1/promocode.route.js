const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { promoCodeValidation } = require('../../validations');
const { promoCodeController } = require('../../controllers');

const router = express.Router();

// Admin routes for managing promo codes
router
  .route('/')
  .post(auth('managePromoCodes'), validate(promoCodeValidation.createPromoCode), promoCodeController.createPromoCode)
  router.get('/all',auth('getPromoCodes'), validate(promoCodeValidation.getPromoCodes), promoCodeController.getPromoCodes);

router
  .get('/analytics', auth('getPromoCodes'), promoCodeController.getPromoCodeStats)
  .get('/user/:userId',auth('getPromoCodes'),  promoCodeController.getPromocodesBasedOnUserType)

router
  .route('/:promoCodeId')
  .get(auth('getPromoCodes'), validate(promoCodeValidation.getPromoCode), promoCodeController.getPromoCode)
  .patch(auth('managePromoCodes'), validate(promoCodeValidation.updatePromoCode), promoCodeController.updatePromoCode)
  .delete(auth('managePromoCodes'), validate(promoCodeValidation.deletePromoCode), promoCodeController.deletePromoCode);

module.exports = router;
