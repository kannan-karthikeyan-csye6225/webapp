import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import statsd from './statsd.js';
import logger from './logger.js';

// Try to load .env file if it exists, but don't fail if it doesn't
dotenv.config({ silent: true });


const queryLogger = (query, timing) => {
  // Log the query
  logger.info(`Executing query: ${query}`);
  
  // If timing is available (from benchmark), send it to StatsD
  if (timing) {
    statsd.timing('database.query.duration', timing);
  }
};

// Use environment variables with fallbacks for local development
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'csye6225',
  process.env.DB_USER || 'csye6225',
  process.env.DB_PASSWORD || 'default_password',
  {
    host: process.env.DB_HOST?.split(':')[0] || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: queryLogger,
    benchmark: true,
    dialectOptions: {
      connectTimeout: 60000 // 60 seconds
    },
    retry: {
      max: 5, // Maximum retry 5 times
      timeout: 3000 // 3 seconds timeout between retries
    }
  }
);

// Add connection error handling
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.warn('Unable to connect to the database:', err);
    // Don't exit the process, let the application continue running
  });