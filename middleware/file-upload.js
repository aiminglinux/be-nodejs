const fs = require('fs');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, uuid() + file.originalname.toLowerCase().split(' '));
  },
});

const uploadMiddleware = (req, res, next) => {
  const singleUpload = multer({
    limits: 500000,
    storage,
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid
        ? null
        : new Error(
            'Unsupported file format, supported file formats: PNG/JPEG/JPG/GIF/WEBP!'
          );
      cb(error, isValid);
    },
  }).single('file');

  singleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500);
      next(err);
    } else if (err) {
      res.status(400);
      next(err);
    }
    next();
  });
};

exports.uploadMiddleware = uploadMiddleware;
