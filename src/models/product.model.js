const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productSchema = mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, enum: ['Men', 'Women', 'Kids', 'Accessories'], required: true },
        subcategory: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        description: { type: String, required: true },
        images: [{ type: String }],
        sizes: [{ type: String }],
        colors: [{ type: String }],
        fabric: { type: String },
        specifications: [{ type: String }],
        rating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        stock: { type: Map, of: Number }, // e.g., { "M": 10, "L": 5 }
        isTrending: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
