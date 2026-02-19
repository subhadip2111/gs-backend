const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
    return Order.create(orderBody);
};

/**
 * Query for orders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
    const orders = await Order.paginate(filter, options);
    return orders;
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id) => {
    return Order.findById(id).populate('user', 'fullName email mobile').populate('items.product');
};

/**
 * Update order status
 * @param {ObjectId} orderId
 * @param {string} status
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.status = status;
    order.trackingSteps.push({
        status,
        description: `Order status updated to ${status}`,
        date: new Date(),
        isCompleted: true,
    });
    await order.save();
    return order;
};

/**
 * Cancel order
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const cancelOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    if (order.status !== 'Processing') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Order can only be cancelled while processing');
    }
    order.status = 'Cancelled';
    order.trackingSteps.push({
        status: 'Cancelled',
        description: 'Order cancelled by user',
        date: new Date(),
        isCompleted: true,
    });
    await order.save();
    return order;
};

module.exports = {
    createOrder,
    queryOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
