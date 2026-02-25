const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body);
    return res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['category', 'subcategory', 'isTrending', 'isNewArrival']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await productService.queryProducts(filter, options);
    res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    res.send(product);
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

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getTrendingProducts,
    getNewArrivals,
    getStats,
};
