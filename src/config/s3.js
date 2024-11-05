import { S3Client } from '@aws-sdk/client-s3';
import logger from './logger.js';
import statsd from './statsd.js';
import dotenv from 'dotenv';

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const trackS3Operation = async (operation, operationType) => {
  const startTime = process.hrtime();
  const metricBase = `s3.${operationType}`;
  
  try {
      // Increment request counter
      statsd.increment(`${metricBase}.requests`);
      logger.info('S3 API Metrics', {
        metric: `${metricBase}.requests`,
        operation: operationType,
        type: 'counter',
        value: 1,
        timestamp: new Date().toISOString()
    });
      
      // Execute the S3 operation
      const result = await operation();
      
      // Record success
      statsd.increment(`${metricBase}.success`);
      logger.info('S3 API Metrics', {
        metric: `${metricBase}.success`,
        operation: operationType,
        type: 'counter',
        value: 1,
        timestamp: new Date().toISOString()
      });
      
      return result;
  } catch (error) {
      // Record failure
      statsd.increment(`${metricBase}.error`);
      logger.info('S3 API Metrics', {
        metric: `${metricBase}.error`,
        operation: operationType,
        type: 'counter',
        value: 1,
        timestamp: new Date().toISOString()
      });
      throw error;
  } finally {
      // Calculate and record timing
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
      
      statsd.timing(`${metricBase}.response_time`, duration);
      logger.info('S3 API Metrics', {
        metric: `${metricBase}`,
        duration: duration,
        operation: operationType,
        type: 'counter',
        value: 1,
        timestamp: new Date().toISOString()
      });
      
      logger.debug('S3 Operation Metrics', {
          operation: operationType,
          duration,
          timestamp: new Date().toISOString()
      });
  }
};
