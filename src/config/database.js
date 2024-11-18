import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import statsd from './statsd.js';
import logger from './logger.js';

dotenv.config({ silent: true });


const queryLogger = (query, timing) => {

  logger.info(`Executing query: ${query}`);
  

  if (timing) {
    statsd.timing('database.query.duration', timing);
  }
};


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
      connectTimeout: 60000 
    },
    retry: {
      max: 5, 
      timeout: 3000 
    }
  }
);


sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.warn('Unable to connect to the database:', err);
    // Don't exit the process, let the application continue running
  });