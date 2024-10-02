import User from '../models/index.js';
import logger from '../config/logger.js';

const allowedKeys = ['first_name', 'last_name', 'email', 'password'];

export const createUser = async (req, res) => {
    try {
        const requestBody = req.body;
        const requestKeys = Object.keys(requestBody);
        const missingKeys = allowedKeys.filter(key => !requestKeys.includes(key));
        const hasInvalidKeys = requestKeys.some(key => !allowedKeys.includes(key)) || missingKeys.length > 0;

        if (hasInvalidKeys) {
            logger.info('Payload contains invalid or missing keys');
            return res.status(400).send();
        }

        const user = await User.create({
            first_name: requestBody.first_name,
            last_name: requestBody.last_name,
            email: requestBody.email,
            password: requestBody.password,
        });

        logger.info(`User created successfully with ID: ${user.id}`);
        res.status(201).json(user);
    } catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        res.status(500).send();
    }
};

export const getUser = async (req, res) => {
    try {
        const userEmail = req.auth.user; 
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            logger.info(`User not found with email: ${userEmail}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't return the password hash
        const { id, first_name, last_name, email, account_created, account_updated } = user;

        res.status(200).json({
            id,
            first_name,
            last_name,
            email,
            account_created,
            account_updated
        });

    } catch (error) {
        logger.error(`Error fetching user: ${error.message}`);
        res.status(500).send();
    }
};