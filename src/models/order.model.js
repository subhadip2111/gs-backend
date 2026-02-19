const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: { type: Number, required: true },
                selectedSize: String,
                selectedColor: String,
                priceAtPurchase: Number,
            },
        ],
        totalAmount: { type: Number, required: true },
        shippingAddress: {
            fullName: String,
            mobile: String,
            street: String,
            village: String,
            city: String,
            pincode: String,
            country: String,
        },
        status: {
            type: String,
            enum: ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
        paymentMethod: { type: String, default: 'COD' },
        appliedCoupon: String,
        discountAmount: { type: Number, default: 0 },
        deliveryDate: String,
        trackingSteps: [
            {
                status: String,
                description: String,
                date: { type: Date, default: Date.now },
                isCompleted: { type: Boolean, default: false },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
