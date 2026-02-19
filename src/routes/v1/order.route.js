const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(orderValidation.createOrder), orderController.createOrder)
    .get(auth('getUsers'), validate(orderValidation.getOrders), orderController.getOrders); // Admin can see all orders

router.get('/me', auth(), orderController.getMyOrders);

router
    .route('/:orderId')
    .get(auth(), validate(orderValidation.getOrder), orderController.getOrder)
    .patch(auth('manageUsers'), validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus); // Admin only

router.patch('/:orderId/cancel', auth(), validate(orderValidation.cancelOrder), orderController.cancelOrder);

module.exports = router;
