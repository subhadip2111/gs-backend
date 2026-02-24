const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const subCategoryController = require('../../controllers/subcategory.controller');
const subCategoryValidation = require('../../validations/subcategory.validation');

const router = express.Router();

router
    .route('/')
    .post(auth('manageSubCategories'), validate(subCategoryValidation.createSubCategory), subCategoryController.createSubCategory)
    .get(validate(subCategoryValidation.getSubCategories), subCategoryController.getSubCategories);

router
    .route('/:subCategoryId')
    .get(validate(subCategoryValidation.getSubCategory), subCategoryController.getSubCategory)
    .patch(auth('manageSubCategories'), validate(subCategoryValidation.updateSubCategory), subCategoryController.updateSubCategory)
    .delete(auth('manageSubCategories'), validate(subCategoryValidation.deleteSubCategory), subCategoryController.deleteSubCategory);

module.exports = router;
