import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.js';
import User from '../models/index.js';
import UserProfilePic from '../models/userProfilePic.js';
import logger from '../config/logger.js';
import statsdClient from '../config/statsd.js';

export const uploadProfilePic = async (req, res) => {
    const startTime = Date.now();
    try {
        const user = await User.findOne({ where: { email: req.auth.user } });
        if (!user) {
            logger.info('User not found');
            res.status(404).send();
            return;
        }

        const fileName = `${user.id}-${Date.now()}-${req.file.originalname}`;
        const s3Path = `profile-pics/${fileName}`;
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Path,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            Metadata: {
                'user-id': user.id,
                'original-name': req.file.originalname,
                'upload-date': new Date().toISOString()
            }
        };

        const s3StartTime = Date.now();
        await s3Client.send(new PutObjectCommand(uploadParams));
        const s3Duration = Date.now() - s3StartTime;
        statsdClient.timing('s3.upload.profile_pic.time', s3Duration); // S3 operation time

        const profilePic = await UserProfilePic.create({
            user_id: user.id,
            file_name: fileName,
            s3_bucket_path: s3Path,
            content_type: req.file.mimetype
        });

        logger.info(`Profile picture uploaded for user: ${user.id}`);
        res.status(201).json(profilePic);
        statsdClient.increment('api.post_profile_pic'); // API call count
    } catch (error) {
        logger.error(`Error uploading profile picture: ${error.message}`);
        res.status(500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.post_profile_pic.time', duration); // API response time
    }
};

export const getProfilePic = async (req, res) => {
    const startTime = Date.now();
    try {
        const user = await User.findOne({ where: { email: req.auth.user } });
        if (!user) {
            logger.info('User not found');
            res.status(404).send();
            return;
        }

        const profilePic = await UserProfilePic.findOne({ where: { user_id: user.id } });
        if (!profilePic) {
            logger.info('No profile picture found');
            res.status(404).send();
            return;
        }

        res.status(200).json(profilePic);
        statsdClient.increment('api.get_profile_pic'); // API call count
    } catch (error) {
        logger.error(`Error fetching profile picture: ${error.message}`);
        res.status(500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.get_profile_pic.time', duration); // API response time
    }
};

export const deleteProfilePic = async (req, res) => {
    const startTime = Date.now();
    try {
        const user = await User.findOne({ where: { email: req.auth.user } });
        if (!user) {
            logger.info('User not found');
            res.status(404).send();
            return;
        }

        const profilePic = await UserProfilePic.findOne({ where: { user_id: user.id } });
        if (!profilePic) {
            logger.info('No profile picture found');
            res.status(404).send();
            return;
        }

        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: profilePic.s3_bucket_path
        };

        const s3StartTime = Date.now();
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        const s3Duration = Date.now() - s3StartTime;
        statsdClient.timing('s3.delete.profile_pic.time', s3Duration); // S3 operation time

        await profilePic.destroy();

        logger.info(`Profile picture deleted for user: ${user.id}`);
        res.status(204).send();
        statsdClient.increment('api.delete_profile_pic'); // API call count
    } catch (error) {
        logger.error(`Error deleting profile picture: ${error.message}`);
        res.status(500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.delete_profile_pic.time', duration); // API response time
    }
};
