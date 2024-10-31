// middlewares/uploadMiddleware.js
import multer from 'multer';
import logger from '../config/logger.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!file) {
    logger.info('No file provided');
    cb(new Error('No file provided'), false);
    return;
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.info(`Invalid file type: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'), false);
  }
};

const uploadConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only one file
  }
}).single('profile_pic');

export const validateFormFields = (req, res, next) => {
  // Get all field names from the multipart form data
  const formFields = Object.keys(req.body || {});
  
  // Check for any fields other than 'profile_pic'
  const unexpectedFields = formFields.filter(field => field !== 'profile_pic');
  
  if (unexpectedFields.length > 0) {
    logger.info(`Unexpected fields in request: ${unexpectedFields.join(', ')}`);
    return res.status(400).send();
  }
  
  next();
};

export const handleUpload = (req, res, next) => {
  uploadConfig(req, res, function(err) {
    if (err) {
      logger.error(`Upload error: ${err.message}`);
      if (err instanceof multer.MulterError) {
        return res.status(400).send();
      }
      return res.status(400).send();
    }
    
    if (!req.file) {
      logger.info('No file uploaded');
      return res.status(400).send();
    }

    // After successful upload, validate form fields
    validateFormFields(req, res, next);
  });
};