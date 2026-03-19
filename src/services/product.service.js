const httpStatus = require('http-status');
const { Product, Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get category IDs matching a search term
 * @param {string} searchTerm
 * @returns {Promise<ObjectId[]>}
 */
const getCategoryIdsByName = async (searchTerm) => {
    const categories = await Category.find({ name: { $regex: searchTerm, $options: 'i' } }).select('_id');
    return categories.map((cat) => cat._id);
};

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
    const product = await Product.create(productBody);
    return product;
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProducts = async (filter, options) => {
    options.populate = 'category,subcategory,brand';
    const products = await Product.paginate(filter, options);
    return products;
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
    return Product.findById(id).populate('category').populate('subcategory').populate('brand');
};

/**
 * Update product by id
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (productId, updateBody) => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    let isPriceDropped = false;
    let newLowestPrice = Infinity;

    if (updateBody.variants) {
        updateBody.variants.forEach((newVariant) => {
            newVariant.sizes.forEach((newSize) => {
                // Find matching variant and size in the current product
                const oldVariant = product.variants.find((v) => v.color.name === newVariant.color.name);
                if (oldVariant) {
                    const oldSize = oldVariant.sizes.find((s) => s.size === newSize.size);
                    if (oldSize && newSize.price < oldSize.price) {
                        isPriceDropped = true;
                        if (newSize.price < newLowestPrice) {
                            newLowestPrice = newSize.price;
                        }
                    }
                }
            });
        });
    }

    Object.assign(product, updateBody);
    await product.save();

    if (isPriceDropped) {
        const { broadcastNotification } = require('./pushNotification.service');
        broadcastNotification('priceDrop', {
            productId: product._id,
            productName: product.name,
            newPrice: newLowestPrice,
            productImage: product.images[0] || (product.variants[0] && product.variants[0].color.images[0]) || '',
            link: `http://localhost:3000/product/${product._id}`,
        }).catch((err) => {
            // Log error but don't fail the update request
            console.error('Error broadcasting price drop notification:', err);
        });
    }

    return product;
};

/**
 * Delete product by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    await product.remove();
    return product;
};

/**
 * Get similar products
 * @param {ObjectId} productId
 * @returns {Promise<Product[]>}
 */
const getSimilarProducts = async (productId) => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Apply the same "Upselling" logic (higher price items) to the similar products API
    const basePrice = product.variants[0]?.sizes[0]?.price || 0;
    const minPrice = basePrice * 1.01; // Slightly more expensive
    const maxPrice = basePrice * 3.0; // Up to 3x price for premium alternatives

    return Product.find({
        category: product.category,
        subcategory: product.subcategory,
        _id: { $ne: productId },
        "variants.sizes.price": { $gte: minPrice, $lte: maxPrice }
    })
        .limit(10)
        .populate('category')
        .populate('subcategory')
        .populate('brand');
};

module.exports = {
    createProduct,
    queryProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    getSimilarProducts,
    getCategoryIdsByName,
};

