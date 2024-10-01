import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../config/logger.js';

// Sync function creates a Table if a table doesn't exist previously. Does nothing if the table exists already
sequelize.sync({ force: false })  // Setting force to 'true' will drop the table and create a fresh one.
  .then(() => {
    logger.info('Postgres Database Created (Synced)');
  })
  .catch((error) => {
    logger.error('Error creating and syncing database:', error);
  });

// Defining the user model
const User = sequelize.define(
  'User',
  {
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING
    }
  },
);

export default User;
