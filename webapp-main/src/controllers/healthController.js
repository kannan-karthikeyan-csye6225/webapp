import logger from '../config/logger.js';
import checkDatabaseHealth from '../services/healthService.js';

export const checkHealth = async (req, res) => {
    const isDatabaseHealthy = await checkDatabaseHealth();

    if (req.method === 'GET') {
        // Check if the GET request has any query params or body content
        if (Object.keys(req.query).length !== 0 || req.get('Content-Length') > 0) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            logger.info('Request contains query params or body - Response will be denied');
            return res.status(400).send();
        }

        // Checking connection with the DB
        if (isDatabaseHealthy) {
            logger.info('GET on /healthz is successful');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send();
        } else {
            logger.error('Database connection failed');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(503).send();  // Return 503 if DB is down
        }
    } else {
        logger.info('Restricted method requested, response is denied');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(405).send();  // Method not allowed
    }
};
