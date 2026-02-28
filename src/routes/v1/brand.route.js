const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const brandController = require('../../controllers/brand.controller');
const brandValidation = require('../../validations/brand.validation');

const router = express.Router();

router
    .route('/')
    .post(auth('manageCategories'), validate(brandValidation.createBrand), brandController.createBrand)
    .get(validate(brandValidation.getBrands), brandController.getBrands);

router
    .route('/:brandId')
    .get(validate(brandValidation.getBrand), brandController.getBrand)
    .patch(auth('manageCategories'), validate(brandValidation.updateBrand), brandController.updateBrand)
    .delete(auth('manageCategories'), validate(brandValidation.deleteBrand), brandController.deleteBrand);

module.exports = router;
