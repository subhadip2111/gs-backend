const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bannerService } = require('../services');
const NodeCache = require('node-cache');

const bannerCache = new NodeCache({ stdTTL: 300, useClones: false }); // 5 minutes, global cache


const createBanner = catchAsync(async (req, res) => {
    const banner = await bannerService.createBanner(req.body);
    bannerCache.flushAll();
    res.status(httpStatus.CREATED).send(banner);
});

const getBanners = catchAsync(async (req, res) => {
    const cacheKey = `banners_${JSON.stringify(req.query)}`;
    const cachedData = bannerCache.get(cacheKey);
    if (cachedData) {
        return res.send(cachedData);
    }

    const filter = pick(req.query, ['type', 'isActive']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    // default sort by order ascending
    if (!options.sortBy) options.sortBy = 'order:asc';
    const result = await bannerService.queryBanners(filter, options);
    
    bannerCache.set(cacheKey, JSON.parse(JSON.stringify(result)));
    res.send(result);
});

const getBanner = catchAsync(async (req, res) => {
    const cacheKey = `banner_${req.params.bannerId}`;
    const cachedData = bannerCache.get(cacheKey);
    if (cachedData) {
        return res.send(cachedData);
    }

    const banner = await bannerService.getBannerById(req.params.bannerId);
    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    
    bannerCache.set(cacheKey, JSON.parse(JSON.stringify(banner)));
    res.send(banner);
});

const updateBanner = catchAsync(async (req, res) => {
    const banner = await bannerService.updateBannerById(req.params.bannerId, req.body);
    bannerCache.flushAll();
    res.send(banner);
});

const deleteBanner = catchAsync(async (req, res) => {
    await bannerService.deleteBannerById(req.params.bannerId);
    bannerCache.flushAll();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createBanner,
    getBanners,
    getBanner,
    updateBanner,
    deleteBanner,
};
