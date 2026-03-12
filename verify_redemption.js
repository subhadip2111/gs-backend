const mongoose = require('mongoose');
const { User, Order, PromoCode, Product, Category, SubCategory, Brand } = require('./src/models');
const { orderService } = require('./src/services');
const config = require('./src/config/config');

const verify = async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // 1. Setup Dependencies
    const brand = await Brand.create({ name: 'Test Brand' });
    const category = await Category.create({ name: 'Test Category' });
    const subcategory = await SubCategory.create({ name: 'Test SubCategory', category: category._id });

    // 2. Setup User
    const userId = new mongoose.Types.ObjectId();
    await User.create({
        _id: userId,
        email: `order_test_${Date.now()}@example.com`,
        fullName: 'Order Test User',
        password: 'password1',
        newUser: true
    });

    // 3. Setup Product
    const productId = new mongoose.Types.ObjectId();
    await Product.create({
        _id: productId,
        sku: `SKU_${Date.now()}`,
        name: 'Test Product',
        description: 'Test Description',
        brand: brand._id,
        category: category._id,
        subcategory: subcategory._id,
        price: 1000,
        variants: [{
            color: { name: 'Red', hex: '#FF0000' },
            sizes: [{ size: 'M', quantity: 10, price: 1000 }]
        }]
    });

    // 4. Setup PromoCode
    const code = `REDEEM_${Date.now()}`;
    const promo = await PromoCode.create({
        code,
        discountType: 'fixed',
        discountValue: 200,
        minOrderAmount: 500,
        maxDiscountAmount: 200,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 10,
        isActive: true,
        users: [userId],
        userType: 'all'
    });

    console.log('Setup complete');

    // 5. Test Redemption
    const orderBody = {
        user: userId,
        items: [{
            product: productId.toString(),
            quantity: 1,
            selectedColor: 'Red',
            selectedSize: 'M'
        }],
        shippingAddress: {
            fullName: 'Test User',
            mobile: '1234567890',
            street: 'Test St',
            village: 'Test Village',
            city: 'Test City',
            pincode: '123456',
            country: 'India'
        },
        couponCode: code,
        orderId: `ORD_TEST_${Date.now()}`
    };

    console.log('Attempting first order creation...');
    const order = await orderService.createOrder(orderBody);
    console.log('Order created. Discount applied:', order.discount);

    // 6. Verify PromoCode State
    const updatedPromo = await PromoCode.findById(promo._id);
    console.log('Updated usedCount:', updatedPromo.usedCount);
    const isUserStillInList = updatedPromo.users.some(id => id.toString() === userId.toString());
    console.log('Is user still in list?', isUserStillInList);

    // 7. Attempt Second Redemption (should fail)
    console.log('Attempting second order creation with same coupon...');
    let secondOrderError = null;
    try {
        await orderService.createOrder(orderBody);
    } catch (error) {
        secondOrderError = error;
        console.log('Second attempt failed as expected:', error.message);
    }

    if (order.discount === 200 && updatedPromo.usedCount === 1 && !isUserStillInList && secondOrderError) {
        console.log('Coupon Redemption Verification Success');
    } else {
        console.log('Coupon Redemption Verification Failure');
        console.log('Expected: discount 200, usedCount 1, user NOT in list, error on second attempt');
        console.log('Actual:', { discount: order.discount, usedCount: updatedPromo.usedCount, isUserInList: isUserStillInList, hasError: !!secondOrderError });
    }

    // Cleanup
    await User.deleteOne({ _id: userId });
    await Product.deleteOne({ _id: productId });
    await PromoCode.deleteOne({ _id: promo._id });
    await Order.deleteOne({ _id: order._id });
    await Brand.deleteOne({ _id: brand._id });
    await Category.deleteOne({ _id: category._id });
    await SubCategory.deleteOne({ _id: subcategory._id });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
};

verify().catch(console.error);
