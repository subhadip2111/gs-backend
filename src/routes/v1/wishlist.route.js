const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const wishlistController = require('../../controllers/wishlist.controller');
const wishlistValidation = require('../../validations/wishlist.validation');

const router = express.Router();

router
    .route('/')
    .get(auth(), wishlistController.getWishlist);

router
    .route('/toggle')
    .post(auth(), validate(wishlistValidation.toggleWishlist), wishlistController.toggleWishlist);

module.exports = router;
