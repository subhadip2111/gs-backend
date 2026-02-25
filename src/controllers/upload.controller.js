const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { uploadSingle, uploadBulk } = require('../utils/uploader');

const uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'No image file provided' });
    }
    const url = await uploadSingle(req.file.buffer, req.body.folder || 'uploads');
    res.status(httpStatus.OK).send({ url });
});

const uploadImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'No image files provided' });
    }
    const buffers = req.files.map((f) => f.buffer);
    const urls = await uploadBulk(buffers, req.body.folder || 'uploads');
    res.status(httpStatus.OK).send({ urls });
});

module.exports = {
    uploadImage,
    uploadImages,
};
