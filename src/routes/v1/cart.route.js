const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartController = require('../../controllers/cart.controller');
const cartValidation = require('../../validations/cart.validation');

const router = express.Router();

router
    .route('/')
    .get(auth(), cartController.getCart)
    .post(auth(), validate(cartValidation.addToCart), cartController.addToCart)
    .delete(auth(), cartController.clearCart);

router
    .route('/:itemId')
    .patch(auth(), validate(cartValidation.updateCartItem), cartController.updateCartItem)
    .delete(auth(), validate(cartValidation.removeFromCart), cartController.removeFromCart);

module.exports = router;
