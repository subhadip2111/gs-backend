const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get user wishlist
 * @param {ObjectId} userId
 * @returns {Promise<Product[]>}
 */
const getWishlist = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'wishlist',
        populate: ['category', 'subcategory', 'brand']
    });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user.wishlist;
};

/**
 * Toggle product in wishlist
 * @param {ObjectId} userId
 * @param {ObjectId} productId
 * @returns {Promise<ObjectId[]>}
 */
const toggleWishlist = async (userId, productId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
        user.wishlist.push(productId);
    } else {
        user.wishlist.splice(index, 1);
    }

    await user.save();
    return user.wishlist;
};

module.exports = {
    getWishlist,
    toggleWishlist,
};
