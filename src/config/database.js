import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;
dotenv.config();

let isDatabaseConnected = true;  // Flag to track DB connection status

// const createDatabaseIfNotExists = async () => {
//   try {
//     const client = new Client({
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: 'postgres',
//     });

//     await client.connect();

//     const dbName = process.env.DB_NAME;
//     const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);

//     if (res.rowCount === 0) {
//       await client.query(`CREATE DATABASE "${dbName}"`);
//       console.log(`Database "${dbName}" created successfully!`);
//     } else {
//       console.log(`Database "${dbName}" already exists.`);
//     }

//     await client.end();
//   } catch (error) {
//     console.error('Error creating database'); // removed the error logging for clean console outputs
//     isDatabaseConnected = false;  // Set flag to false if DB creation fails
//     // throw error;
//   }
// };

const initializeSequelize = async () => {
  try {
    await createDatabaseIfNotExists();
  } catch (error) {
    console.error('Database is offline or cannot be created'); // removed the error logging for clean console outputs
    isDatabaseConnected = false;  // Set flag to false if DB connection fails
  }

  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database'); // removed the error logging for clean console outputs
    isDatabaseConnected = false;  // Set flag to false if DB connection fails
  }

  return sequelize;
};

const sequelize = await initializeSequelize();

export { sequelize, isDatabaseConnected };
