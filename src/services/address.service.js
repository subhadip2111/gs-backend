const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get all addresses for a user
 */
const getAddresses = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    return user.addresses;
};

/**
 * Add a new address
 */
const addAddress = async (userId, addressBody) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    // If first address, make it default automatically
    if (user.addresses.length === 0) {
        addressBody.isDefault = true;
    }
    // If new address is default, unset existing defaults
    if (addressBody.isDefault) {
        user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push(addressBody);
    await user.save();
    return user.addresses;
};

/**
 * Update an address
 */
const updateAddress = async (userId, addressId, updateBody) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');

    // If setting as default, unset others first
    if (updateBody.isDefault) {
        user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    Object.assign(address, updateBody);
    await user.save();
    return user.addresses;
};

/**
 * Delete an address
 */
const deleteAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');

    user.addresses = user.addresses.filter((addr) => addr.id !== addressId);
    await user.save();
    return user.addresses;
};

/**
 * Set an address as default
 */
const setDefaultAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');

    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;
    await user.save();
    return user.addresses;
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
