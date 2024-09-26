import logger from '../config/logger.js';
import checkDatabaseHealth from '../services/healthService.js';

export const checkHealth = async (req, res) => {
    const isDatabaseHealthy = await checkDatabaseHealth();

    if (req.method === 'GET') {
        // Checks if the GET request has any query params
        if (Object.keys(req.query).length !== 0) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            logger.info('Request contains query params - Response will be denied');
            return res.status(400).send();
        }

        // Checks the content-length in the request header. With that, we'll be able to find if there are any body attached to the request.
        const contentLength = req.get('Content-Length');
        if (contentLength && parseInt(contentLength, 10) > 0) {
            // If Content-Length is greater than 0, reject the request
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            logger.info('GET request contains body - Response will be denied');
            return res.status(400).send();
        }


        // Checks if the GET request has any form data in it
        // if (req.is('multipart/form-data') || req.is('application/x-www-form-urlencoded')) {
        //     res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        //     logger.info('Request contains form-data - Response will be denied');
        //     return res.status(400).send();
        // }

        // Checking connection with the DB
        if (isDatabaseHealthy) {
            logger.info('GET on /healthz is successful');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send();
        } else {
            logger.error('Database connection failed');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(503).send();
        }
    } else {
        logger.info('Restricted method requested, response is denied');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(405).send();
    }
};
