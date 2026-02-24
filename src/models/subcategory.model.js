const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const subCategorySchema = mongoose.Schema(
    {

        name: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },



    },
    {
        timestamps: true,
    }
);

subCategorySchema.plugin(toJSON);
subCategorySchema.plugin(paginate);

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
