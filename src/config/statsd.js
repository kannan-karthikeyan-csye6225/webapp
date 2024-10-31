import StatsD from 'hot-shots';
import logger from './logger.js';


const statsd = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: process.env.STATSD_PORT || 8125,
  prefix: 'webapp.',
  errorHandler: error => {
    logger.error('StatsD error:', error);
  }
});


export default statsd;