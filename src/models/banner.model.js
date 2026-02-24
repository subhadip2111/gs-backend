const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bannerSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['banner', 'popup', 'sidebar'],
            default: 'banner',
        },
        imageUrl: { type: String, required: true },
        title: { type: String, required: true },
        subtitle: { type: String },
        description: { type: String },
        ctaText: { type: String },
        ctaLink: { type: String },
        secondaryCtaText: { type: String },
        secondaryCtaLink: { type: String },
        badge: { type: String },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

bannerSchema.plugin(toJSON);
bannerSchema.plugin(paginate);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
