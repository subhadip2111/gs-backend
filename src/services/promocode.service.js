const { userService } = require('./index');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { PromoCode, User, Order } = require('../models');

const createPromoCode = async (promoCodeBody) => {
    if (promoCodeBody.userType) {
        const userIds = await userService.getUserIdsByType(promoCodeBody.userType);
        promoCodeBody.users = userIds;
    }
    const promoCode = await PromoCode.create(promoCodeBody);

    // Trigger broadcast notification
    const { broadcastNotification } = require('./pushNotification.service');
    const discountText = promoCode.discountType === 'percentage' 
        ? `${promoCode.discountValue}% OFF` 
        : `₹${promoCode.discountValue} OFF`;
    
    broadcastNotification('newPromocode', {
        code: promoCode.code,
        discount: discountText,
        endDate: promoCode.endDate.toLocaleDateString(),
        imageUrl: 'https://img.freepik.com/premium-vector/special-offer-banner-with-discount-promo-code_1017-26055.jpg', // Generic promo image
        link: 'http://localhost:3000/shop',
    }).catch((err) => {
        console.error('Error broadcasting promocode notification:', err);
    });

    return promoCode;
}

const queryPromoCodes = async (filter = {}, options = {}) => {
    const query = {};

    // Clean and handle filters
    if (filter.search) {
        query.code = { $regex: filter.search, $options: "i" };
    } else if (filter.code) {
        query.code = { $regex: filter.code, $options: "i" };
    }

    if (filter.isActive !== undefined && filter.isActive !== '') {
        query.isActive = filter.isActive === 'true' || filter.isActive === true;
    }

    // Handle pagination using the paginate plugin
    const paginateOptions = {
        sortBy: options.sortBy || 'createdAt:desc',
        limit: parseInt(options.limit, 10) || 10,
        page: parseInt(options.page, 10) || 1,
    };

    const result = await PromoCode.paginate(query, paginateOptions);
    return result;
};
const getPromoCodeById = async (id) => {
    return PromoCode.findById(id);
}

const updatePromoCode = async (id, updateBody) => {
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) throw new ApiError(httpStatus.NOT_FOUND, 'PromoCode not found');

    if (updateBody.userType) {
        const userIds = await userService.getUserIdsByType(updateBody.userType);
        updateBody.users = userIds;
    }

    Object.assign(promoCode, updateBody);
    await promoCode.save();
    return promoCode;
}

const deletePromoCode = async (id) => {
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) throw new ApiError(httpStatus.NOT_FOUND, 'PromoCode not found');
    await promoCode.remove();
    return promoCode;
}

const getPromoCodeStats = async () => {
    const totalPromoCodes = await PromoCode.countDocuments();
    const activePromoCodes = await PromoCode.countDocuments({ isActive: true });

    const usedCountAgg = await PromoCode.aggregate([
        {
            $group: {
                _id: null,
                totalUsed: { $sum: '$usedCount' }
            }
        }
    ]);

    const totalUsed = usedCountAgg.length > 0 ? usedCountAgg[0].totalUsed : 0;

    return {
        totalPromoCodes,
        activePromoCodes,
        totalUsed,
    };
};

const getPromocodesBasedOnUserType = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const userTypes = ['all'];
    if (user.newUser) {
        userTypes.push('newUser');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
        user: userId,
        status: 'Delivered',
        createdAt: { $gte: sixMonthsAgo }
    });

    const last30DaysOrders = orders.filter(o => o.createdAt >= thirtyDaysAgo);
    const last3MonthsOrders = orders.filter(o => o.createdAt >= threeMonthsAgo);
    const last6MonthsOrders = orders;

    const total6MonthsAmount = last6MonthsOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // prime_user: > 20,000 spent and > 5 orders in last 6 months
    if (total6MonthsAmount > 20000 && last6MonthsOrders.length > 5) {
        userTypes.push('prime_user');
    }

    // regular_user: >= 1 order in last 30 days and total < 20,000
    if (last30DaysOrders.length >= 1 && total6MonthsAmount <= 20000) {
        userTypes.push('regular_user');
    }

    // frequent_user: >= 3 orders in last 6 months and total < 20,000
    if (last6MonthsOrders.length >= 3 && total6MonthsAmount <= 20000) {
        userTypes.push('frequent_user');
    }

    // inactive_user: 0 orders in last 3 months
    if (last3MonthsOrders.length === 0) {
        userTypes.push('inactive_user');
    }

    const promocodes = await PromoCode.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        users: userId, // User must be in the allowed list
        $or: [
            { userType: { $in: userTypes } },
            { userType: { $exists: false } },
            { userType: null }
        ]
    });

    return promocodes;
};

module.exports = {
    createPromoCode,
    queryPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    getPromoCodeStats,
    getPromocodesBasedOnUserType,
}