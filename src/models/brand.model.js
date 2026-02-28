const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const brandSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

brandSchema.plugin(toJSON);
brandSchema.plugin(paginate);

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
