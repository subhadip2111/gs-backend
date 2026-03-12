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

const getMonthlySales = catchAsync(async (req, res) => {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const result = await adminService.getMonthlySales(year);
    res.send(result);
});

const getTopCategories = catchAsync(async (req, res) => {
    const result = await adminService.getTopCategories();
    res.send(result);
});

const getSalesPerformance = catchAsync(async (req, res) => {
    const result = await adminService.getSalesPerformance();
    res.send(result);
});

const getUsersByCategory = catchAsync(async (req, res) => {
    const query = pick(req.query, ['type', 'startDate', 'endDate','keyword']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await adminService.getUsersByCategory(query, options);
    res.send(result);
});

const getUserStats = catchAsync(async (req, res) => {
    const result = await adminService.getUserStats();
    res.send(result);
});

module.exports = {
    getStats,
    getAllProducts,
    getAllOrders,
    getAllCustomers,
    getMonthlySales,
    getTopCategories,
    getSalesPerformance,
    getUsersByCategory,
    getUserStats,
};
