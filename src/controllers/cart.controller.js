const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const getCart = catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.send(cart);
});

const addToCart = catchAsync(async (req, res) => {
    const cart = await cartService.addToCart(req.user.id, req.body);
    res.send(cart);
});

const updateCartItem = catchAsync(async (req, res) => {
    const cart = await cartService.updateCartItem(req.user.id, req.params.itemId, req.body.quantity);
    res.send(cart);
});

const removeFromCart = catchAsync(async (req, res) => {
    const cart = await cartService.removeFromCart(req.user.id, req.params.itemId);
    res.send(cart);
});

const clearCart = catchAsync(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
