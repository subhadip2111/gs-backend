const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderController = require('../../controllers/order.controller');
const orderValidation = require('../../validations/order.validation');

const router = express.Router();

// User routes
router
    .route('/')
    .post(auth(), validate(orderValidation.createOrder), orderController.createOrder)
    .get(auth('getUsers'), validate(orderValidation.getOrders), orderController.getOrders); // Admin: all orders

router.get('/me', auth(), orderController.getMyOrders);                                      // User: my orders
router.get('/stats', auth('getUsers'), orderController.getOrderStats);                       // Admin: stats

router
    .route('/:orderId')
    .get(auth(), validate(orderValidation.getOrder), orderController.getOrder)
    .patch(auth('manageUsers'), validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus); // Admin: update status

router.patch('/:orderId/cancel', auth(), validate(orderValidation.cancelOrder), orderController.cancelOrder); // User: cancel

module.exports = router;
