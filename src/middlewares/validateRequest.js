import logger from '../config/logger.js';

const hasContent = (req) => {
  // Check if the request has any body content
  const contentLength = req.headers['content-length'];
  const hasBody = contentLength && parseInt(contentLength) > 0;
  
  // Check if there's actual content in the body
  const hasBodyContent = Object.keys(req.body || {}).length > 0;
  
  // Check for query parameters
  const hasQueryParams = Object.keys(req.query || {}).length > 0;
  
  return hasBody || hasBodyContent || hasQueryParams;
};

export const validateProfilePicUpload = (req, res, next) => {
  // For upload, we only validate the file which is already handled by multer
  next();
};

export const validateProfilePicGet = (req, res, next) => {
  if (hasContent(req)) {
    logger.info('GET request should not contain body or query parameters');
    return res.status(400).send();
  }
  next();
};

export const validateProfilePicDelete = (req, res, next) => {
    if (hasContent(req)) {
      logger.info('DELETE request should not contain body or query parameters');
      return res.status(400).send();
    }
    next();
  };