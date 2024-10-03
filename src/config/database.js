import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg
dotenv.config()

const createDatabaseIfNotExists = async () => {
  try {
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'postgres',
    });

    await client.connect();

    const dbName = process.env.DB_NAME;
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }

    await client.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

const initializeSequelize = async () => {
  await createDatabaseIfNotExists();

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
    console.error('Unable to connect to the database:', error);
  }

  return sequelize;
};

const sequelize = await initializeSequelize();

export default sequelize;
