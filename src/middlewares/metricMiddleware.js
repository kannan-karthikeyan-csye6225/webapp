// middlewares/statsdMiddleware.js
import statsd from '../config/statsd.js';
import logger from '../config/logger.js';

export const metricMiddleware = (req, res, next) => {
    try {
        // Clean the route path for metric naming
        const routePath = req.baseUrl + req.route.path;
        const cleanRoute = routePath
            .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
            .replace(/\//g, '_') // Replace remaining slashes with underscores
            .replace(/:/g, '') // Remove path parameter markers
            .replace(/[^a-zA-Z0-9_]/g, ''); // Remove any other special characters
        
        const method = req.method.toLowerCase();
        const metricPrefix = `api.${method}.${cleanRoute}`;

        // Increment API counter
        statsd.increment(`${metricPrefix}.count`);
        
        // Start timing the request
        const startTime = process.hrtime();
        
        // Capture response time on response finish
        res.on('finish', () => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
            statsd.timing(`${metricPrefix}.duration`, duration);
            
            logger.info('API Metrics', {
                route: cleanRoute,
                method: method,
                duration: duration,
                statusCode: res.statusCode
            });
        });

        next();
    } catch (error) {
        logger.error('Error in StatsD middleware:', error);
        next();
    }
};