const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get user cart
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getCart = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'cart.product',
        populate: ['category', 'subcategory', 'brand']
    });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user.cart;
};

/**
 * Add item to cart
 * @param {ObjectId} userId
 * @param {Object} itemBody
 * @returns {Promise<Object>}
 */
const addToCart = async (userId, itemBody) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const { productId, quantity, color, size } = itemBody;

    // Check if item already exists with same color/size
    const existingItem = user.cart.find(
        (item) =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        user.cart.push({ product: productId, quantity, color, size });
    }

    await user.save();
    return user.cart;
};

/**
 * Update cart item quantity
 * @param {ObjectId} userId
 * @param {ObjectId} itemId
 * @param {number} quantity
 * @returns {Promise<Object>}
 */
const updateCartItem = async (userId, itemId, quantity) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const item = user.cart.id(itemId);
    if (!item) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }

    item.quantity = quantity;
    await user.save();
    return user.cart;
};

/**
 * Remove item from cart
 * @param {ObjectId} userId
 * @param {ObjectId} itemId
 * @returns {Promise<Object>}
 */
const removeFromCart = async (userId, itemId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.cart = user.cart.filter((item) => item.id !== itemId);
    await user.save();
    return user.cart;
};

/**
 * Clear user cart
 * @param {ObjectId} userId
 * @returns {Promise<void>}
 */
const clearCart = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    user.cart = [];
    await user.save();
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
