const { Product, Order, User } = require('../models');

/**
 * Get consolidated stats for admin dashboard
 * @returns {Promise<Object>}
 */
const getAdminStats = async () => {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Calculate total revenue from delivered orders
    const deliveredOrders = await Order.find({ status: 'Delivered' });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    const pendingOrders = await Order.countDocuments({ status: 'Processing' });

    return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
    };
};

module.exports = {
    getAdminStats,
};
