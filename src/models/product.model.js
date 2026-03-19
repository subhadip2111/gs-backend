const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productSchema = mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
      
        description: { type: String, required: true },
        images: [{ type: String }],
        variants: [{
            color: {
                name: { type: String, required: true },
                hex: { type: String, required: true },
                images: [{ type: String }],
            },
            sizes: [{
                size: { type: String, required: true },
                quantity: { type: Number, required: true, default: 0 },
                price: { type: Number, required: true },
                originalPrice: { type: Number },
            }],
        }],
        fabric: { type: String },
        specifications: [{ type: String }],
        rating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        isTrending: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: false },
        isBestSeller: { type: Boolean, default: false },
        materialAndCare: [{ type: String }],
        sizeAndFit: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);
productSchema.index({
  name: "text",
  description: "text",
});

productSchema.index({ isTrending: 1, createdAt: -1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNewArrival: 1 });

productSchema.index({ category: 1, isTrending: 1, createdAt: -1 });
productSchema.index({ brand: 1, category: 1 });
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
