const mongoose = require('mongoose');
const { User, Order } = require('./src/models');
const { userService, orderService, pushNotificationService } = require('./src/services');
const config = require('./src/config/config');

const verify = async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // 1. Setup User with dummy FCM token
    const userId = new mongoose.Types.ObjectId();
    const user = await User.create({
        _id: userId,
        email: `push_test_${Date.now()}@example.com`,
        fullName: 'Push Test User',
        password: 'password1',
        fcmTokens: ['dummy_token_123'],
        newUser: true
    });
    console.log('Setup User');

    // 2. Test New User Notification
    console.log('Testing NEW_USER notification...');
    // We can call the service directly to test logic
    await pushNotificationService.triggerNotification('newUser', {}, user);

    // 3. Setup dummy Order
    const orderId = new mongoose.Types.ObjectId();
    const orderDoc = {
        _id: orderId,
        orderId: `ORD_PUSH_${Date.now()}`,
        user: userId,
        items: [],
        totalAmount: 1000,
        status: 'Processing'
    };
    const order = await Order.create(orderDoc);
    console.log('Setup Order');

    // 4. Test Order Status Update Notification
    console.log('Testing ORDER_UPDATE (Shipped) notification...');
    await orderService.updateOrderStatus(order._id, 'Shipped');

    // 5. Test Order Cancellation Notification
    console.log('Testing ORDER_UPDATE (Cancelled) notification...');
    await orderService.cancelOrder(order._id, userId);

    // 6. Test Refund Notification
    console.log('Testing ORDER_UPDATE (Refunded) notification...');
    await orderService.refundOrder(order._id);

    console.log('\nVerification calls completed.');
    console.log('Note: If Firebase config is missing, you will see warnings but no errors.');
    console.log('Check Firestore "notifications" collection for 4 new records.');

    // Cleanup
    await User.deleteOne({ _id: userId });
    await Order.deleteOne({ _id: orderId });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
};

verify().catch(console.error);
