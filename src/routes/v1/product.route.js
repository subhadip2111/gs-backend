const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productController = require('../../controllers/product.controller');
const productValidation = require('../../validations/product.validation');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), validate(productValidation.createProduct), productController.createProduct) // Admin only
    .get(validate(productValidation.getProducts), productController.getProducts);

router.get('/trending', productController.getTrendingProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/stats', auth('getUsers'), productController.getStats);

router
    .route('/:productId')
    .get(validate(productValidation.getProduct), productController.getProduct)
    .patch(auth('manageUsers'), validate(productValidation.updateProduct), productController.updateProduct) // Admin only
    .delete(auth('manageUsers'), validate(productValidation.deleteProduct), productController.deleteProduct); // Admin only

module.exports = router;
