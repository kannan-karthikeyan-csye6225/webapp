import statsd from './statsd.js';
import logger from './logger.js';
import { s3Client } from './s3.js';

export const trackS3Operation = async (s3Command, params, operationName) => {
  const metricPrefix = `s3.${operationName}`;
  const startTime = process.hrtime();

  try {
    const result = await s3Client.send(new s3Command(params));

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    statsd.timing(`${metricPrefix}.duration`, duration);
    statsd.increment(`${metricPrefix}.count`);
    logger.info(`S3 ${operationName} successful`, { duration, params });

    return result;
  } catch (error) {
    logger.error(`S3 ${operationName} failed`, { error, params });
    throw error;
  }
};
