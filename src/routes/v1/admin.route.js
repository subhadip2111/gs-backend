const express = require('express');
const auth = require('../../middlewares/auth');
const adminController = require('../../controllers/admin.controller');
const productController = require('../../controllers/product.controller');
const orderController = require('../../controllers/order.controller');

const validate = require('../../middlewares/validate');
const { adminValidation, productValidation, orderValidation } = require('../../validations');

const router = express.Router();

// All routes here require admin privileges
router.use(auth('manageUsers'));

router.get('/stats', adminController.getStats);
router.get('/customers', adminController.getAllCustomers);
router.get('/customers/categorized', validate(adminValidation.getUsersByCategory), adminController.getUsersByCategory);
router.get('/dashboard/user-stats', adminController.getUserStats);

// Dashboard analytics routes
router.get('/dashboard/stats', adminController.getStats);
router.get('/dashboard/monthly-sales', adminController.getMonthlySales);
router.get('/dashboard/top-categories', adminController.getTopCategories);
router.get('/dashboard/sales-performance', adminController.getSalesPerformance)
router.get('/dashboard/user-order-history/:userId', adminController.getAuserOrderHistory)
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
