const express = require('express');
const auth = require('../../middlewares/auth');
const adminController = require('../../controllers/admin.controller');
const productController = require('../../controllers/product.controller');
const orderController = require('../../controllers/order.controller');

const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const orderValidation = require('../../validations/order.validation');

const router = express.Router();

// All routes here require admin privileges
router.use(auth('manageUsers'));

router.get('/stats', adminController.getStats);
router.get('/customers', adminController.getAllCustomers);

router.route('/products')
    .get(validate(productValidation.getProducts), adminController.getAllProducts)
    .post(validate(productValidation.createProduct), productController.createProduct);

router.route('/products/:productId')
    .patch(validate(productValidation.updateProduct), productController.updateProduct)
    .delete(validate(productValidation.deleteProduct), productController.deleteProduct);

router.route('/orders')
    .get(validate(orderValidation.getOrders), adminController.getAllOrders);

router.route('/orders/:orderId/status')
    .patch(validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);

module.exports = router;
