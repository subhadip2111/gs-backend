const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { adminService, productService, orderService, userService } = require('../services');
const pick = require('../utils/pick');

const getStats = catchAsync(async (req, res) => {
    const stats = await adminService.getAdminStats();
    res.send(stats);
});

const getAllProducts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['category', 'subcategory', 'isTrending', 'isNewArrival']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await productService.queryProducts(filter, options);
    res.send(result);
});

const getAllOrders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'user']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await orderService.queryOrders(filter, options);
    res.send(result);
});

const getAllCustomers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    filter.role = 'customer';
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await userService.queryUsers(filter, options);
    res.send(result);
});

module.exports = {
    getStats,
    getAllProducts,
    getAllOrders,
    getAllCustomers,
};
