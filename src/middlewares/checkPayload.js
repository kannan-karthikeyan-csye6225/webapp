import logger from "../config/logger.js";

export const checkPayload = (req, res, next) => {
    const contentLength = req.headers['content-length'];
    const hasPayload = Object.keys(req.body).length > 0;
    const hasQueryParams = Object.keys(req.query).length > 0;

    if (['GET', 'PUT'].includes(req.method)) {
        if (req.method === 'GET' && contentLength && contentLength > 0) {
            return res.status(400).send();
        }
        if (req.method === 'PUT' && !hasPayload) {
            return res.status(400).send();
        }
        if (hasQueryParams) {
            return res.status(400).send();
        }
    }

    logger.info("Bad request - checkPayload function returns 400")
    next();
};


