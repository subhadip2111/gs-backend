// Clear CLOUDINARY_URL before import to prevent SDK auto-parse conflicts
delete process.env.CLOUDINARY_URL;

const cloudinary = require('cloudinary').v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single image buffer to Cloudinary
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} [folder] - Optional Cloudinary folder
 * @returns {Promise<string>} - The secure public URL
 */
const uploadSingle = (fileBuffer, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
};

/**
 * Upload multiple image buffers to Cloudinary
 * @param {Buffer[]} fileBuffers - Array of image file buffers
 * @param {string} [folder] - Optional Cloudinary folder
 * @returns {Promise<string[]>} - Array of secure public URLs
 */
const uploadBulk = async (fileBuffers, folder = 'uploads') => {
    const urls = await Promise.all(
        fileBuffers.map((buffer) => uploadSingle(buffer, folder))
    );
    return urls;
};

module.exports = {
    uploadSingle,
    uploadBulk,
};
