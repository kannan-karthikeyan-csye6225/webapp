import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
});


// import { S3Client } from '@aws-sdk/client-s3';
// import logger from './logger.js';
// import dotenv from 'dotenv';

// dotenv.config();

// // Verify required environment variables
// const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME', 'AWS_REGION'];
// const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// if (missingEnvVars.length > 0) {
//     logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
//     throw new Error('Missing required AWS configuration');
// }

// export const s3Client = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     }
// });

// // Test the S3 connection
// const testS3Connection = async () => {
//     try {
//         const creds = await s3Client.config.credentials();
//         logger.info('Successfully loaded AWS credentials');
//         logger.info(`Using AWS Region: ${s3Client.config.region}`);
//         logger.info(`Using S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
//     } catch (error) {
//         logger.error(`Failed to load AWS credentials: ${error.message}`);
//     }
// };

// testS3Connection();