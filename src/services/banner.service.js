const httpStatus = require('http-status');
const { Banner } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a banner
 * @param {Object} bannerBody
 * @returns {Promise<Banner>}
 */
const createBanner = async (bannerBody) => {
    return Banner.create(bannerBody);
};

/**
 * Query for banners
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryBanners = async (filter, options) => {
    const banners = await Banner.paginate(filter, options);
    return banners;
};

/**
 * Get banner by id
 * @param {ObjectId} id
 * @returns {Promise<Banner>}
 */
const getBannerById = async (id) => {
    return Banner.findById(id);
};

/**
 * Update banner by id
 * @param {ObjectId} bannerId
 * @param {Object} updateBody
 * @returns {Promise<Banner>}
 */
const updateBannerById = async (bannerId, updateBody) => {
    const banner = await getBannerById(bannerId);
    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    Object.assign(banner, updateBody);
    await banner.save();
    return banner;
};

/**
 * Delete banner by id
 * @param {ObjectId} bannerId
 * @returns {Promise<Banner>}
 */
const deleteBannerById = async (bannerId) => {
    const banner = await getBannerById(bannerId);
    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    await banner.deleteOne();
    return banner;
};

module.exports = {
    createBanner,
    queryBanners,
    getBannerById,
    updateBannerById,
    deleteBannerById,
};
