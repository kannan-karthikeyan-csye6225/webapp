import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './index.js';

const UserProfilePic = sequelize.define('user_profile_pic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  s3_bucket_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

User.hasOne(UserProfilePic, { foreignKey: 'user_id' });
UserProfilePic.belongsTo(User, { foreignKey: 'user_id' });

export default UserProfilePic;