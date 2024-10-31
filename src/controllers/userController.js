import User from '../models/index.js';
import logger from '../config/logger.js';
import statsdClient from '../config/statsd.js';

const allowedKeysForCreation = ['first_name', 'last_name', 'email', 'password'];
const allowedKeysForUpdation = ['first_name', 'last_name', 'password'];

export const createUser = async (req, res) => {
    const startTime = Date.now();
    try {
        const requestBody = req.body;
        const requestKeys = Object.keys(requestBody);
        const missingKeys = allowedKeysForCreation.filter(key => !requestKeys.includes(key));
        const invalidKeys = requestKeys.filter(key => !allowedKeysForCreation.includes(key));

        if (missingKeys.length > 0 || invalidKeys.length > 0) {
            logger.info('Payload contains invalid or missing keys');
            res.status(400).send();
            return;
        }

        const dbStartTime = Date.now();
        const user = await User.create(requestBody);
        const dbDuration = Date.now() - dbStartTime;
        statsdClient.timing('db.query.create_user.time', dbDuration);

        logger.info(`User created successfully with ID: ${user.id}`);
        res.status(201).json(user);
        statsdClient.increment('api.post_user'); // API call count
    } catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        res.status(error.name === 'SequelizeValidationError' ? 400 : 500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.post_user.time', duration); // API response time
    }
};

export const getUser = async (req, res) => {
    const startTime = Date.now();
    try {
        const userEmail = req.auth.user;
        
        const dbStartTime = Date.now();
        const user = await User.findOne({ where: { email: userEmail } });
        const dbDuration = Date.now() - dbStartTime;
        statsdClient.timing('db.query.get_user.time', dbDuration);

        if (!user) {
            logger.info(`User not found with email: ${userEmail}`);
            res.status(404).send();
            return;
        }

        logger.info(`User retrieved successfully with email: ${userEmail}`);
        res.status(200).json(user);
        statsdClient.increment('api.get_user'); // API call count
    } catch (error) {
        logger.error(`Error fetching user: ${error.message}`);
        res.status(500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.get_user.time', duration); // API response time
    }
};

export const updateUser = async (req, res) => {
    const startTime = Date.now();
    try {
        const requestBody = req.body;
        const requestKeys = Object.keys(requestBody);
        const missingKeys = allowedKeysForUpdation.filter(key => !requestKeys.includes(key));
        const hasInvalidKeys = requestKeys.some(key => !allowedKeysForUpdation.includes(key)) || missingKeys.length > 0;

        if (hasInvalidKeys) {
            logger.info('Payload contains invalid or missing keys for PUT request');
            res.status(400).send();
            return;
        }

        const userEmail = req.auth.user;

        const dbStartTime = Date.now();
        const user = await User.findOne({ where: { email: userEmail } });
        const dbDuration = Date.now() - dbStartTime;
        statsdClient.timing('db.query.update_user.time', dbDuration);

        if (!user) {
            logger.info("User not found for update");
            res.status(404).send();
            return;
        }

        user.first_name = requestBody.first_name;
        user.last_name = requestBody.last_name;
        user.password = requestBody.password;
        await user.save();

        logger.info(`User with email: ${userEmail} updated successfully`);
        res.status(204).send();
        statsdClient.increment('api.put_user'); // API call count
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).send();
    } finally {
        const duration = Date.now() - startTime;
        statsdClient.timing('api.put_user.time', duration); // API response time
    }
};
