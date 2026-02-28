const httpStatus = require('http-status');
const { Order, Product } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an order — auto-calculates totalAmount from product prices
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
    const { items } = orderBody;

    // Auto-fetch product prices and calculate totalAmount
    let totalAmount = 0;
    const enrichedItems = await Promise.all(
        items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new ApiError(httpStatus.NOT_FOUND, `Product not found: ${item.product}`);
            const priceAtPurchase = product.price;
            totalAmount += priceAtPurchase * item.quantity;
            return { ...item, priceAtPurchase };
        })
    );

    return Order.create({ ...orderBody, items: enrichedItems, totalAmount });
};

/**
 * Query for orders
 */
const queryOrders = async (filter, options) => {
    options.populate = 'user,items.product';
    const orders = await Order.paginate(filter, options);
    return orders;
};

/**
 * Get order by id
 */
const getOrderById = async (id) => {
    return Order.findById(id)
        .populate('user', 'fullName email mobile')
        .populate('items.product');
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
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
 * Cancel order (user — only while Processing)
 */
const cancelOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    if (order.user.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
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

/**
 * Get order statistics (admin)
 */
const getOrderStats = async () => {
    const statuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const totalOrders = await Order.countDocuments();
    const breakdown = await Promise.all(
        statuses.map(async (status) => ({
            status,
            count: await Order.countDocuments({ status }),
        }))
    );
    return { totalOrders, breakdown };
};

module.exports = {
    createOrder,
    queryOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
};
