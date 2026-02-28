const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const addressController = require('../../controllers/address.controller');
const addressValidation = require('../../validations/address.validation');

const router = express.Router();

router
    .route('/')
    .get(auth(), addressController.getAddresses)
    .post(auth(), validate(addressValidation.addAddress), addressController.addAddress);

router
    .route('/:addressId')
    .patch(auth(), validate(addressValidation.updateAddress), addressController.updateAddress)
    .delete(auth(), validate(addressValidation.deleteAddress), addressController.deleteAddress);

router.patch('/:addressId/default', auth(), validate(addressValidation.setDefaultAddress), addressController.setDefaultAddress);

module.exports = router;
