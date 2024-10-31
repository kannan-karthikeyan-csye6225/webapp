import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.js';
import User from '../models/index.js';
import UserProfilePic from '../models/userProfilePic.js';
import logger from '../config/logger.js';

/**
 * Uploads a profile picture to S3 and saves metadata to database
 */
export const uploadProfilePic = async (req, res, next) => {
  try {
    // Find user from auth credentials
    const user = await User.findOne({ 
      where: { email: req.auth.user } 
    });
    
    if (!user) {
      logger.info('User not found');
      return res.status(404).send();
    }

    // Check for existing profile picture
    const existingPic = await UserProfilePic.findOne({
      where: { user_id: user.id }
    });
    
    if (existingPic) {
      logger.info('User already has a profile picture. Delete existing picture first.');
      return res.status(400).send();
    }

    // Prepare file name and S3 path
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
    const bucketName = process.env.S3_BUCKET_NAME;
    const s3Path = `profile-pics/${fileName}`;

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Path,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        'user-id': user.id,
        'original-name': req.file.originalname,
        'upload-date': new Date().toISOString()
      }
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Save metadata to database and get the created record
    const createdProfilePic = await UserProfilePic.create({
      user_id: user.id,
      file_name: fileName,
      s3_bucket_path: s3Path,
      content_type: req.file.mimetype
    });

    // Fetch the complete profile pic record
    const profilePic = await UserProfilePic.findOne({
      where: { id: createdProfilePic.id },
      attributes: ['id', 'file_name', 's3_bucket_path', 'upload_date', 'user_id']
    });

    logger.info(`Profile picture uploaded successfully for user: ${user.id}`);
    
    // Set cache control headers
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(201).json({
      file_name: profilePic.file_name,
      id: profilePic.id,
      url: `${process.env.S3_BUCKET_NAME}/${profilePic.s3_bucket_path}`,
      upload_date: profilePic.upload_date.toISOString().split('T')[0],
      user_id: profilePic.user_id
    });

  } catch (error) {
    logger.error(`Error uploading profile picture: ${error.message}`);
    next(error);
  }
};

/**
 * Gets the profile picture metadata
 */
export const getProfilePic = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      where: { email: req.auth.user } 
    });
    
    if (!user) {
      logger.info('User not found');
      return res.status(404).send();
    }

    const profilePic = await UserProfilePic.findOne({
      where: { user_id: user.id },
      attributes: ['id', 'file_name', 's3_bucket_path', 'upload_date', 'user_id']
    });

    if (!profilePic) {
      logger.info('No profile picture found');
      return res.status(404).send();
    }

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(200).json({
      file_name: profilePic.file_name,
      id: profilePic.id,
      url: `${process.env.S3_BUCKET_NAME}/${profilePic.s3_bucket_path}`,
      upload_date: profilePic.upload_date.toISOString().split('T')[0],
      user_id: profilePic.user_id
    });

  } catch (error) {
    logger.error(`Error getting profile picture metadata: ${error.message}`);
    next(error);
  }
};

/**
 * Deletes a profile picture
 */
export const deleteProfilePic = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      where: { email: req.auth.user } 
    });
    
    if (!user) {
      logger.info('User not found');
      return res.status(404).send();
    }

    const profilePic = await UserProfilePic.findOne({
      where: { user_id: user.id }
    });

    if (!profilePic) {
      logger.info('No profile picture found');
      return res.status(404).send();
    }

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: profilePic.s3_bucket_path
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    await profilePic.destroy();

    logger.info(`Profile picture deleted successfully for user: ${user.id}`);
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(204).send();

  } catch (error) {
    logger.error(`Error deleting profile picture: ${error.message}`);
    if (error.name === 'NoSuchKey') {
      return res.status(404).send();
    }
    next(error);
  }
};