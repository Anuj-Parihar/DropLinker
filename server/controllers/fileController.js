const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
}).single('file');

exports.uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 100MB limit' });
      }
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const downloadLink = uuidv4();
      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        downloadLink: downloadLink,
      });

      await file.save();

      res.status(201).json({
        message: 'File uploaded successfully',
        downloadLink: downloadLink,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      // Clean up the uploaded file if there's an error
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Error saving file to database' });
    }
  });
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ downloadLink: req.params.link });
    if (!file) {
      return res.status(404).json({ error: 'File not found or link expired' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading file' });
  }
};

exports.getFileInfo = async (req, res) => {
  try {
    const file = await File.findOne({ downloadLink: req.params.link });
    if (!file) {
      return res.status(404).json({ error: 'File not found or link expired' });
    }

    res.json({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      createdAt: file.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching file info' });
  }
};