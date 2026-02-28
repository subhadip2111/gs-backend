const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { wishlistService } = require('../services');

const getWishlist = catchAsync(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.send(wishlist);
});

const toggleWishlist = catchAsync(async (req, res) => {
    const wishlist = await wishlistService.toggleWishlist(req.user.id, req.body.productId);
    res.send(wishlist);
});

module.exports = {
    getWishlist,
    toggleWishlist,
};
