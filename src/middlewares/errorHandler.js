export const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      logger.error(`Multer error: ${err.message}`);
      return res.status(400).send();
    }
    
    if (err.message === 'Invalid file type. Only JPEG, JPG and PNG files are allowed.') {
      logger.error(`File validation error: ${err.message}`);
      return res.status(400).send();
    }
  
    if (err.message === 'File too large') {
      logger.error(`File size error: ${err.message}`);
      return res.status(400).send();
    }
  
    logger.error(`Unhandled error: ${err.message}`);
    return res.status(500).send();
  };