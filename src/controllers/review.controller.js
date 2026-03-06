const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { reviewService } = require('../services');
const { uploadBulk } = require('../utils/uploader');

const createReview = catchAsync(async (req, res) => {
    const reviewBody = {
        ...req.body,
        product: req.params.productId,
        user: req.user.id,
    };

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
        const buffers = req.files.map((f) => f.buffer);
        const imageUrls = await uploadBulk(buffers, 'reviews');
        reviewBody.images = imageUrls;
    }

    const review = await reviewService.createReview(reviewBody);
    res.status(httpStatus.CREATED).send(review);
});

const getReviews = catchAsync(async (req, res) => {
    const filter = { product: req.params.productId };
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await reviewService.queryReviews(filter, options);
    res.send(result);
});

module.exports = {
    createReview,
    getReviews,
};
