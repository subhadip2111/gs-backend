const mongoose = require('mongoose');
const { User, Order, PromoCode } = require('./src/models');
const { promoCodeService } = require('./src/services');
const config = require('./src/config/config');

const verify = async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log('Connected to MongoDB');

  // 1. Setup User
  const userId = new mongoose.Types.ObjectId();
  await User.create({
    _id: userId,
    email: `test_${Date.now()}@example.com`,
    fullName: 'Test User',
    password: 'password1',
    newUser: true
  });

  // 2. Setup Orders (make user a prime_user: >20k spent, >5 orders in 6 months)
  const orders = [];
  for (let i = 0; i < 6; i++) {
    orders.push({
      orderId: `ORD_${Date.now()}_${i}`,
      user: userId,
      totalAmount: 4000,
      status: 'Delivered',
      createdAt: new Date()
    });
  }
  await Order.insertMany(orders);

  // 3. Setup PromoCodes
  const p1 = await PromoCode.create({
    code: `PRIME_${Date.now()}`,
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    maxDiscountAmount: 100,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    usageLimit: 10,
    isActive: true,
    userType: 'prime_user'
  });

  const p2 = await PromoCode.create({
    code: `NEW_${Date.now()}`,
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    maxDiscountAmount: 100,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    usageLimit: 10,
    isActive: true,
    userType: 'newUser'
  });

  const p3 = await PromoCode.create({
    code: `ALL_${Date.now()}`,
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    maxDiscountAmount: 100,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    usageLimit: 10,
    isActive: true,
    userType: 'all'
  });

  console.log('Test data created');

  // 4. Verify
  const result = await promoCodeService.getPromocodesBasedOnUserType(userId);
  console.log('Promocodes found:', result.map(p => p.code));
  
  const codes = result.map(p => p.code);
  const expectedCodes = [p1.code, p2.code, p3.code];
  const allFound = expectedCodes.every(c => codes.includes(c));

  if (allFound) {
      console.log('User-Specific Promocode Verification Success');
  } else {
      console.log('User-Specific Promocode Verification Failure');
  }

  // Cleanup
  await User.deleteOne({ _id: userId });
  await Order.deleteMany({ user: userId });
  await PromoCode.deleteMany({ _id: { $in: [p1._id, p2._id, p3._id] } });

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

verify().catch(console.error);
