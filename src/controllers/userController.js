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
