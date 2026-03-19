const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService, reviewService, aiService } = require('../services');
const { Category, SubCategory } = require('../models');
const NodeCache = require('node-cache');

const productCache = new NodeCache({ stdTTL: 180, useClones: false }); // 3 minutes, disabled cloning to avoid Mongoose issues


const createProduct = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body);
    return res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
    const cacheKey = `products_${req.user.id}_${JSON.stringify(req.query)}`;
    const cachedData = productCache.get(cacheKey);
    if (cachedData) {
        return res.send(cachedData);
    }

    const filter = pick(req.query, ['category', 'subcategory', 'brand', 'fabric', 'isTrending', 'isNewArrival', 'isBestSeller']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Search by name, SKU, or category name (case-insensitive)
    if (req.query.search) {
        const searchRegex = { $regex: req.query.search, $options: 'i' };
        const matchingCategoryIds = await productService.getCategoryIdsByName(req.query.search);

        const orConditions = [
            { name: searchRegex },
            { sku: searchRegex },
        ];

        if (matchingCategoryIds.length > 0) {
            orConditions.push({ category: { $in: matchingCategoryIds } });
        }

        filter.$or = orConditions;
    }

    const result = await productService.queryProducts(filter, options);
    // Convert to plain object to avoid cloning issues with Mongoose documents
    productCache.set(cacheKey, JSON.parse(JSON.stringify(result)));
    res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Fetch the latest 5 reviews for the product
    const reviews = await reviewService.queryReviews(
        { product: req.params.productId },
        { limit: 5, sortBy: 'createdAt:desc' }
    );

    const productJson = product.toJSON();
    productJson.reviews = reviews.results;

    res.send(productJson);
});

const getAiRecommendations = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Call AI service to get suggested categories based on current product
    const suggestions = await aiService.suggestRelatedCategories(product);
    
    // Find category and subcategory IDs based on names returned by AI
    const [catIds, subCatIds] = await Promise.all([
        Category.find({ name: { $in: suggestions.categories } }).distinct('_id'),
        SubCategory.find({ name: { $in: suggestions.subcategories } }).distinct('_id')
    ]);

    // Calculate price range for "Upselling" recommendations
    // Focus on products that are similar but at a higher price point (premium options)
    const basePrice = product.variants[0]?.sizes[0]?.price || 0;
    // We look for products that are more expensive to sell a "premium product at a greater price"
    const minPrice = basePrice * 1.01; // Slightly more expensive
    const maxPrice = basePrice * 3.0; // Up to 3x the price for premium alternatives

    const filter = {
        _id: { $ne: product._id },
        $or: [
            { category: { $in: catIds } },
            { subcategory: { $in: subCatIds } }
        ],
        "variants.sizes.price": { $gte: minPrice, $lte: maxPrice }
    };

    const result = await productService.queryProducts(filter, { limit: 10 });
    res.send(result);
});

const updateProduct = catchAsync(async (req, res) => {
    const product = await productService.updateProductById(req.params.productId, req.body);
    res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
    await productService.deleteProductById(req.params.productId);
    res.status(httpStatus.NO_CONTENT).send();
});

const getTrendingProducts = catchAsync(async (req, res) => {
    const result = await productService.queryProducts({ isTrending: true }, { limit: 10 });
    res.send(result);
});

const getNewArrivals = catchAsync(async (req, res) => {
    const result = await productService.queryProducts({ isNewArrival: true }, { limit: 10 });
    res.send(result);
});

const getStats = catchAsync(async (req, res) => {
    const totalProducts = await productService.queryProducts({}, { limit: 1 });
    const trendingProductsCount = await productService.queryProducts({ isTrending: true }, { limit: 1 });
    const newArrivalsCount = await productService.queryProducts({ isNewArrival: true }, { limit: 1 });

    res.send({
        totalProducts: totalProducts.totalResults,
        trendingProducts: trendingProductsCount.totalResults,
        newArrivals: newArrivalsCount.totalResults,
    });
});

const getSimilarProducts = catchAsync(async (req, res) => {
    const result = await productService.getSimilarProducts(req.params.productId);
    res.send(result);
});

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getTrendingProducts,
    getNewArrivals,
    getStats,
    getSimilarProducts,
    getAiRecommendations,
};

