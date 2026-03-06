const { Product, Order, User } = require('../models');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get consolidated stats for admin dashboard (last 30 days focus)
 * @returns {Promise<Object>}
 */
const getAdminStats = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingOrders = await Order.countDocuments({ status: 'Processing' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    // Aggregate sales & revenue for non-cancelled orders in last 30 days
    const [salesAgg] = await Order.aggregate([
        {
            $match: {
                status: { $ne: 'Cancelled' },
                createdAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$totalAmount' },
                totalRevenue: { $sum: { $subtract: ['$totalAmount', { $ifNull: ['$discountAmount', 0] }] } },
                count: { $sum: 1 },
            },
        },
    ]);

    const totalSales = salesAgg ? salesAgg.totalSales : 0;
    const totalRevenue = salesAgg ? salesAgg.totalRevenue : 0;
    const orderCount = salesAgg ? salesAgg.count : 0;
    const averageOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

    return {
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        cancelledOrders,
        averageOrderValue,
        period: 'last_30_days',
    };
};

/**
 * Get monthly sales & revenue for a given year
 * @param {number} year
 * @returns {Promise<Object>}
 */
const getMonthlySales = async (year) => {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'Cancelled' },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                sales: { $sum: '$totalAmount' },
                revenue: { $sum: { $subtract: ['$totalAmount', { $ifNull: ['$discountAmount', 0] }] } },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Build a full 12-month array, filling in zeroes for months with no data
    const monthlyMap = {};
    result.forEach((r) => {
        monthlyMap[r._id] = { sales: r.sales, revenue: r.revenue, orders: r.orders };
    });

    const monthlySales = MONTH_NAMES.map((month, idx) => ({
        month,
        sales: monthlyMap[idx + 1] ? monthlyMap[idx + 1].sales : 0,
        revenue: monthlyMap[idx + 1] ? monthlyMap[idx + 1].revenue : 0,
        orders: monthlyMap[idx + 1] ? monthlyMap[idx + 1].orders : 0,
    }));

    return { year, monthlySales };
};

/**
 * Get top selling categories
 * @returns {Promise<Object>}
 */
const getTopCategories = async () => {
    const result = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productData',
            },
        },
        { $unwind: '$productData' },
        {
            $lookup: {
                from: 'categories',
                localField: 'productData.category',
                foreignField: '_id',
                as: 'categoryData',
            },
        },
        { $unwind: '$categoryData' },
        {
            $group: {
                _id: '$categoryData._id',
                name: { $first: '$categoryData.name' },
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
    ]);

    // Calculate percentage share of totalSold
    const grandTotal = result.reduce((sum, r) => sum + r.totalSold, 0);

    const topCategories = result.map((r) => ({
        category: { id: r._id, name: r.name },
        totalSold: r.totalSold,
        totalRevenue: r.totalRevenue,
        percentage: grandTotal > 0 ? Math.round((r.totalSold / grandTotal) * 100) : 0,
    }));

    return { topCategories };
};

/**
 * Get daily sales performance for the last 30 days
 * @returns {Promise<Object>}
 */
const getSalesPerformance = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
                status: { $ne: 'Cancelled' },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                sales: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const dailySales = result.map((r) => ({
        date: r._id,
        sales: r.sales,
        orders: r.orders,
    }));

    return { period: 'last_30_days', dailySales };
};

module.exports = {
    getAdminStats,
    getMonthlySales,
    getTopCategories,
    getSalesPerformance,
};
