import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';

// Sync function creates a Table if a table doesn't exist previously. Does nothing if the table exists already
sequelize.sync({ force: false })  // Setting force to 'true' will drop the table and create a fresh one.
  .then(() => {
    logger.info('models/index.js - Postgres Database Created (Synced)');
  })
  .catch((error) => {
    logger.error('models/index.js - Error creating and syncing database'); // removed the error logging for clean console outputs
  });

// Defining the user model
const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      validate: {
        isAlpha: true
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        isAlpha: true
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING
    }
  },
  {
    createdAt: 'account_created',
    updatedAt: 'account_updated'
  }
);

User.beforeCreate(async (user) => {
  const saltRounds = 10; 
  user.password = await bcrypt.hash(user.password, saltRounds);
});

User.beforeUpdate(async (user) => {
  const saltRounds = 10;
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, saltRounds); 
  }
});

export default User;
