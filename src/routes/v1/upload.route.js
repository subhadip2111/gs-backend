const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

// Use memory storage so file buffers are available directly
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// POST /v1/upload       - single image  (field name: "image")
router.post('/single', auth('manageUsers'), upload.single('image'), uploadController.uploadImage);

// POST /v1/upload/bulk  - multiple images (field name: "images", max 10)
router.post('/bulk', auth('manageUsers'), upload.array('images', 10), uploadController.uploadImages);

module.exports = router;
