import User from '../models/index.js';
import logger from '../config/logger.js';
import { request } from 'express';

const allowedKeysForCreation = ['first_name', 'last_name', 'email', 'password'];
const optionalKeys = ['account_created', 'account_updated'];
const allowedKeysForUpdation = ['first_name', 'last_name', 'password'];

export const createUser = async (req, res) => {
    try {
        const requestBody = req.body;
        const requestKeys = Object.keys(requestBody);

        const missingKeys = allowedKeysForCreation.filter(key => !requestKeys.includes(key));

        const invalidKeys = requestKeys.filter(key => ![...allowedKeysForCreation, ...optionalKeys].includes(key));

        if (missingKeys.length > 0 || invalidKeys.length > 0) {
            logger.info('Payload contains invalid or missing keys');
            return res.status(400).send();
        }

        const { account_created, account_updated, ...userData } = requestBody;

        const user = await User.create(userData);

        const { password, ...userWithoutPassword } = user.get({ plain: true }); // creating this variable just to send response to the user

        logger.info(`User created successfully with ID: ${user.id}`);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(201).json(userWithoutPassword);
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

        const missingKeys = allowedKeysForUpdation.filter(key => !requestKeys.includes(key));
        const hasInvalidKeys = requestKeys.some(key => !allowedKeysForUpdation.includes(key)) || missingKeys.length > 0;

        if (hasInvalidKeys) {
            logger.info('Payload contains invalid or missing keys for PUT request');
            return res.status(400).send();
        }

        const user = await User.findOne({ where: { email: req.auth.user } });

        if (!user) {
            logger.info("User not found - check userController - updateUser function")
            return res.status(404).send();
        }

        user.first_name = requestBody.first_name;
        user.last_name = requestBody.last_name;
        user.password = requestBody.password;

        await user.save();

        logger.info(`User with email: ${user.email} updated successfully`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).send();
    }
};