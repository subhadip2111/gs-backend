const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bannerController = require('../../controllers/banner.controller');
const bannerValidation = require('../../validations/banner.validation');

const router = express.Router();

router
    .route('/')
    .post(auth('manageBanners'), validate(bannerValidation.createBanner), bannerController.createBanner)
    .get(validate(bannerValidation.getBanners), bannerController.getBanners);

router
    .route('/:bannerId')
    .get(validate(bannerValidation.getBanner), bannerController.getBanner)
    .patch(auth('manageBanners'), validate(bannerValidation.updateBanner), bannerController.updateBanner)
    .delete(auth('manageBanners'), validate(bannerValidation.deleteBanner), bannerController.deleteBanner);

module.exports = router;
