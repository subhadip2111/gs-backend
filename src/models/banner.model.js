const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bannerSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['banner', 'popup', 'sidebar','brands'],
            default: 'banner',
        },
        imageUrl: { type: String, required: false },
        title: { type: String, required: true },
        subtitle: { type: String },
        description: { type: String },
        ctaText: { type: String },
        ctaLink: { type: String },
        brands: [{
            name: { type: String, required: true },
            imageUrl: { type: String, required: true },
            description: { type: String },
            link: { type: String },
            tagline: { type: String },
        }],
        secondaryCtaText: { type: String },
        secondaryCtaLink: { type: String },
        badge: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

bannerSchema.plugin(toJSON);
bannerSchema.plugin(paginate);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
