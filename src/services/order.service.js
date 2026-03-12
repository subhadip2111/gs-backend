const httpStatus = require('http-status');
const { Order, Product, PromoCode } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an order — auto-calculates totalAmount from product prices and applies promocodes
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
    const { items, appliedCoupon, user } = orderBody;

    // Auto-fetch product prices, check stock, and calculate totalAmount
    let totalAmount = 0;
    const enrichedItems = await Promise.all(
        items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) throw new ApiError(httpStatus.NOT_FOUND, `Product not found: ${item.product}`);

            // Find matching variant and size to check stock
            const variant = product.variants.find((v) => v.color.name === item.selectedColor);
            if (!variant) throw new ApiError(httpStatus.BAD_REQUEST, `Color variant not found: ${item.selectedColor}`);

            const sizeOption = variant.sizes.find((s) => s.size === item.selectedSize);
            if (!sizeOption) throw new ApiError(httpStatus.BAD_REQUEST, `Size option not found: ${item.selectedSize}`);

            if (sizeOption.quantity < item.quantity) {
                throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient stock for product ${product.name}, color ${item.selectedColor}, size ${item.selectedSize}. Available: ${sizeOption.quantity}`);
            }

            // Temporarily update totalAmount and enrich item
            const priceAtPurchase = variant.sizes[0].price;
            totalAmount += priceAtPurchase * item.quantity;
            return { ...item, priceAtPurchase };
        })
    );
    
    let discountAmount = 0;

    // Validate and apply promocode
    if (appliedCoupon) {
        const promo = await PromoCode.findOne({ code: appliedCoupon, isActive: true });
        if (!promo) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or inactive promo code');
        }
        
        const now = new Date();
        if (now < promo.startDate || now > promo.endDate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Promo code is expired or not yet active');
        }

        if (promo.usedCount >= promo.usageLimit) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Promo code usage limit reached');
        }

        if (totalAmount < promo.minOrderAmount) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Order amount must be at least ${promo.minOrderAmount} to apply this promo code`);
        }

        if (promo.users.some((userId) => userId.toString() === user.toString())) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'You have already used this promo code');
        }

        if (promo.discountType === 'percentage') {
            discountAmount = (totalAmount * promo.discountValue) / 100;
        } else if (promo.discountType === 'fixed') {
            discountAmount = promo.discountValue;
        }

        if (discountAmount > promo.maxDiscountAmount) {
            discountAmount = promo.maxDiscountAmount;
        }

        totalAmount -= discountAmount;
        
        // Update promo code usage atomically
        await PromoCode.updateOne(
            { _id: promo._id },
            { 
                $inc: { usedCount: 1 },
                $push: { users: user }
            }
        );
    }

    // After all validation, decrement the stock
    await Promise.all(
        items.map(async (item) => {
            await Product.updateOne(
                {
                    _id: item.product,
                    'variants.color.name': item.selectedColor,
                    'variants.sizes.size': item.selectedSize,
                },
                {
                    $inc: { 'variants.$[v].sizes.$[s].quantity': -item.quantity },
                },
                {
                    arrayFilters: [{ 'v.color.name': item.selectedColor }, { 's.size': item.selectedSize }],
                }
            );
        })
    );

    // Update user status
    await User.updateOne({ _id: user }, { newUser: false });

    return Order.create({ ...orderBody, items: enrichedItems, totalAmount, discountAmount });
};

/**
 * Query for orders
 */
const queryOrders = async (filter, options) => {
    options.populate = 'user,items.product';
    const orders = await Order.paginate(filter, options);
    return orders;
};

/**
 * Get order by id
 */
const getOrderById = async (id) => {
    return Order.findById(id)
        .populate('user', 'fullName email mobile')
        .populate('items.product');
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    order.status = status;
    order.trackingSteps.push({
        status,
        description: `Order status updated to ${status}`,
        date: new Date(),
        isCompleted: true,
    });
    await order.save();
    return order;
};

/**
 * Cancel order (user — only while Processing)
 */
const cancelOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    if (order.user.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
    if (order.status !== 'Processing') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Order can only be cancelled while processing');
    }
    order.status = 'Cancelled';
    order.trackingSteps.push({
        status: 'Cancelled',
        description: 'Order cancelled by user',
        date: new Date(),
        isCompleted: true,
    });
    await order.save();

    // Restore stock for each cancelled item
    await Promise.all(
        order.items.map(async (item) => {
            await Product.updateOne(
                {
                    _id: item.product,
                    'variants.color.name': item.selectedColor,
                    'variants.sizes.size': item.selectedSize,
                },
                {
                    $inc: { 'variants.$[v].sizes.$[s].quantity': item.quantity },
                },
                {
                    arrayFilters: [{ 'v.color.name': item.selectedColor }, { 's.size': item.selectedSize }],
                }
            );
        })
    );

    return order;
};

/**
 * Get order statistics (admin)
 */
const getOrderStats = async () => {
    const statuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const totalOrders = await Order.countDocuments();
    const breakdown = await Promise.all(
        statuses.map(async (status) => ({
            status,
            count: await Order.countDocuments({ status }),
        }))
    );
    return { totalOrders, breakdown };
};

module.exports = {
    createOrder,
    queryOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
};
