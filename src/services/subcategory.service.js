const httpStatus = require('http-status');
const { SubCategory, Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a subcategory
 * @param {Object} subCategoryBody
 * @returns {Promise<SubCategory>}
 */
const createSubCategory = async (subCategoryBody) => {
    const category = await Category.findById(subCategoryBody.category);
    if (!category) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
    return SubCategory.create(subCategoryBody);
};

/**
 * Query for subcategories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const querySubCategories = async (filter, options) => {
  const subCategories = await SubCategory.paginate(filter, {
    ...options,
    populate: "category",
  });

  return subCategories;
};

/**
 * Get subcategory by id
 * @param {ObjectId} id
 * @returns {Promise<SubCategory>}
 */
const getSubCategoryById = async (id) => {
    return SubCategory.findById(id).populate('category', 'name');
};

/**
 * Update subcategory by id
 * @param {ObjectId} subCategoryId
 * @param {Object} updateBody
 * @returns {Promise<SubCategory>}
 */
const updateSubCategoryById = async (subCategoryId, updateBody) => {
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }
    if (updateBody.category) {
        const category = await Category.findById(updateBody.category);
        if (!category) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
        }
    }
    Object.assign(subCategory, updateBody);
    await subCategory.save();
    return subCategory;
};

/**
 * Delete subcategory by id
 * @param {ObjectId} subCategoryId
 * @returns {Promise<SubCategory>}
 */
const deleteSubCategoryById = async (subCategoryId) => {
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }
    await subCategory.deleteOne();
    return subCategory;
};

module.exports = {
    createSubCategory,
    querySubCategories,
    getSubCategoryById,
    updateSubCategoryById,
    deleteSubCategoryById,
};
