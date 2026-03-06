const httpStatus = require('http-status');
const { Review, Product } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Update product rating and reviews count
 * @param {ObjectId} productId
 * @returns {Promise<void>}
 */
const updateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].averageRating * 10) / 10,
            reviewsCount: stats[0].count,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            reviewsCount: 0,
        });
    }
};

/**
 * Create a review
 * @param {Object} reviewBody
 * @returns {Promise<Review>}
 */
const createReview = async (reviewBody) => {
    const { product: productId } = reviewBody;
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const review = await Review.create(reviewBody);
    await updateProductRating(productId);
    return review;
};

/**
 * Query for reviews
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryReviews = async (filter, options) => {
    options.populate = 'user';
    const reviews = await Review.paginate(filter, options);
    return reviews;
};

module.exports = {
    createReview,
    queryReviews,
    updateProductRating,
};
