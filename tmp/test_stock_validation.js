const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Product, Order, User } = require('../src/models');
const { createOrder } = require('../src/services/order.service');
const ApiError = require('../src/utils/ApiError');
const config = require('../src/config/config');

const runTest = async () => {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        // 1. Create a dummy user if not exists
        let user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            user = await User.create({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            });
        }

        // 2. Create a test product
        const productData = {
            sku: 'TEST-SKU-' + Date.now(),
            name: 'Test Product',
            brand: new mongoose.Types.ObjectId(),
            category: new mongoose.Types.ObjectId(),
            subcategory: new mongoose.Types.ObjectId(),
            price: 100,
            description: 'Test Description',
            variants: [{
                color: {
                    name: 'Red',
                    hex: '#FF0000',
                },
                sizes: [{
                    size: 'M',
                    quantity: 10,
                }],
            }],
        };
        const product = await Product.create(productData);
        console.log('Created test product with stock: 10');

        // 3. Attempt to order more than available (should fail)
        console.log('Attempting to order 11 items (should fail)...');
        const failOrderBody = {
            orderId: 'ORD-FAIL-' + Date.now(),
            user: user._id,
            items: [{
                product: product._id,
                quantity: 11,
                selectedSize: 'M',
                selectedColor: 'Red',
            }],
            shippingAddress: { city: 'Test City' },
            totalAmount: 1100,
        };

        try {
            await createOrder(failOrderBody);
            console.error('ERROR: Order succeeded but should have failed due to stock!');
        } catch (error) {
            console.log('SUCCESS: Order failed as expected:', error.message);
        }

        // 4. Attempt to order available amount (should succeed)
        console.log('Attempting to order 2 items (should succeed)...');
        const successOrderBody = {
            orderId: 'ORD-SUCCESS-' + Date.now(),
            user: user._id,
            items: [{
                product: product._id,
                quantity: 2,
                selectedSize: 'M',
                selectedColor: 'Red',
            }],
            shippingAddress: { city: 'Test City' },
            totalAmount: 200,
        };

        await createOrder(successOrderBody);
        console.log('SUCCESS: Order created successfully');

        // 5. Verify stock decrement
        const updatedProduct = await Product.findById(product._id);
        const remainingStock = updatedProduct.variants[0].sizes[0].quantity;
        console.log('Remaining stock:', remainingStock);

        if (remainingStock === 8) {
            console.log('FINAL RESULT: Stock decrement logic verified!');
        } else {
            console.error(`FINAL RESULT ERROR: Expected 8 items, but got ${remainingStock}`);
        }

    } catch (error) {
        console.error('Test execution error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

runTest();
