const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService, addressService } = require('../services');

const createOrder = catchAsync(async (req, res) => {
    const { addressId, shippingAddress, ...rest } = req.body;
    let resolvedAddress = shippingAddress;

    // If user passed a saved addressId, look it up from their profile
    if (addressId) {
        const addresses = await addressService.getAddresses(req.user.id);
        const saved = addresses.id ? addresses.id(addressId) : addresses.find((a) => a._id.toString() === addressId);
        if (!saved) throw new ApiError(httpStatus.NOT_FOUND, 'Saved address not found');
        resolvedAddress = saved;
    }

    if (!resolvedAddress) throw new ApiError(httpStatus.BAD_REQUEST, 'shippingAddress or addressId is required');

    const orderBody = {
        ...rest,
        shippingAddress: resolvedAddress,
        user: req.user.id,
        orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };

    const order = await orderService.createOrder(orderBody);
    res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'user']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await orderService.queryOrders(filter, options);
    res.send(result);
});

const getMyOrders = catchAsync(async (req, res) => {
    const filter = { user: req.user.id };
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await orderService.queryOrders(filter, options);
    res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    // Check if user is owner or admin
    if (order.user.id !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
    res.send(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status);
    res.send(order);
});

const cancelOrder = catchAsync(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.orderId, req.user.id);
    res.send(order);
});

const getOrderStats = catchAsync(async (req, res) => {
    const stats = await orderService.getOrderStats();
    res.send(stats);
});

module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
};
