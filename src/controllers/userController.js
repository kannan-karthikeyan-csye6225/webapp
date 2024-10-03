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
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(201).json(user);
    } catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(500).send();
    }
};

export const getUser = async (req, res) => {
    try {
        const userEmail = req.auth.user; 
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            logger.info(`User not found with email: ${userEmail}`);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(404).send();
        }

        const { id, first_name, last_name, email, account_created, account_updated } = user;

        if (req.method === 'GET'){ // Explicitly mentioning this if statement because HEAD method will send a 200 without this
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(200).json({
                id,
                first_name,
                last_name,
                email,
                account_created,
                account_updated
            });
        }
        else{
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(405).send();
        }
    } catch (error) {
        logger.error(`Error fetching user: ${error.message}`);
        res.status(500).send();
    }
};

export const updateUser = async (req, res) => {
    try {
        const requestBody = req.body;
        const requestKeys = Object.keys(requestBody);

        const missingKeys = allowedKeys.filter(key => !requestKeys.includes(key));
        const hasInvalidKeys = requestKeys.some(key => !allowedKeys.includes(key)) || missingKeys.length > 0;

        if (hasInvalidKeys) {
            logger.info('Payload contains invalid or missing keys for PUT request');
            return res.status(400).send();
        }

        const user = await User.findOne({ where: { email: req.auth.user } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.first_name = requestBody.first_name;
        user.last_name = requestBody.last_name;
        user.password = requestBody.password;

        await user.save();

        logger.info(`User with email: ${user.email} updated successfully`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};