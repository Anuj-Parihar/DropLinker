const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/upload', fileController.uploadFile);
router.get('/download/:link', fileController.downloadFile);
router.get('/info/:link', fileController.getFileInfo);

module.exports = router;