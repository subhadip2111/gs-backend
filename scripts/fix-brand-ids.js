const mongoose = require('mongoose');
const config = require('../src/config/config');
const { Product, Brand } = require('../src/models');

const fixBrandIds = async () => {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        // 1. Get all brands
        const brands = await Brand.find({});
        const brandMap = {};
        brands.forEach((brand) => {
            brandMap[brand.name.toLowerCase()] = brand._id;
        });

        console.log(`Found ${brands.length} brands in the database.`);

        // 2. Find products with string brands
        const allProducts = await Product.find({});
        let updateCount = 0;

        for (const product of allProducts) {
            // Check if brand is a string (not an ObjectId or not in the brands collection)
            if (typeof product.brand === 'string' && !mongoose.Types.ObjectId.isValid(product.brand)) {
                const brandName = product.brand.toLowerCase();
                const brandId = brandMap[brandName];

                if (brandId) {
                    console.log(`Fixing product "${product.name}": Mapping brand "${product.brand}" to ID ${brandId}`);
                    product.brand = brandId;
                    await product.save();
                    updateCount++;
                } else {
                    console.warn(`Warning: Product "${product.name}" has unknown brand "${product.brand}". No matching Brand document found.`);
                }
            } else if (mongoose.Types.ObjectId.isValid(product.brand)) {
                // Double check if the brand ID actually exists in the Brand collection
                const exists = brands.find(b => b._id.toString() === product.brand.toString());
                if (!exists && brands.length > 0) {
                    console.warn(`Warning: Product "${product.name}" has brand ID ${product.brand} which does not exist in Brand collection.`);
                }
            }
        }

        console.log(`Cleanup complete. Updated ${updateCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

fixBrandIds();
