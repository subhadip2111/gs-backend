const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { platformReviewValidation } = require('../../validations');
const { platformReviewController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(platformReviewValidation.createPlatformReview), platformReviewController.createPlatformReview)
  .get(validate(platformReviewValidation.getPlatformReviews), platformReviewController.getPlatformReviews);

router
  .route('/:reviewId')
  .delete(auth('admin'), validate(platformReviewValidation.deletePlatformReview), platformReviewController.deletePlatformReview);

module.exports = router;
