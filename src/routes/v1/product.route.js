const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productController = require('../../controllers/product.controller');
const productValidation = require('../../validations/product.validation');
const reviewController = require('../../controllers/review.controller');
const reviewValidation = require('../../validations/review.validation');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), validate(productValidation.createProduct), productController.createProduct) // Admin only
    .get(validate(productValidation.getProducts), productController.getProducts);

router.get('/trending', productController.getTrendingProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/stats', auth('getUsers'), productController.getStats);
router.get('/:productId/similar', validate(productValidation.getProduct), productController.getSimilarProducts);

router
    .route('/:productId')
    .get(validate(productValidation.getProduct), productController.getProduct)
    .patch(auth('manageUsers'), validate(productValidation.updateProduct), productController.updateProduct) // Admin only
    .delete(auth('manageUsers'), validate(productValidation.deleteProduct), productController.deleteProduct); // Admin only

// Review routes
router
    .route('/:productId/reviews')
    .get(validate(reviewValidation.getReviews), reviewController.getReviews)
    .post(auth(), upload.array('images', 5), validate(reviewValidation.createReview), reviewController.createReview);

module.exports = router;
