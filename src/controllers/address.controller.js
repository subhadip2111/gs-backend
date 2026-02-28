const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { addressService } = require('../services');

const getAddresses = catchAsync(async (req, res) => {
    const addresses = await addressService.getAddresses(req.user.id);
    res.send(addresses);
});

const addAddress = catchAsync(async (req, res) => {
    const addresses = await addressService.addAddress(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(addresses);
});

const updateAddress = catchAsync(async (req, res) => {
    const addresses = await addressService.updateAddress(req.user.id, req.params.addressId, req.body);
    res.send(addresses);
});

const deleteAddress = catchAsync(async (req, res) => {
    await addressService.deleteAddress(req.user.id, req.params.addressId);
    res.status(httpStatus.NO_CONTENT).send();
});

const setDefaultAddress = catchAsync(async (req, res) => {
    const addresses = await addressService.setDefaultAddress(req.user.id, req.params.addressId);
    res.send(addresses);
});

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
