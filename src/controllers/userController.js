import User from '../models/index.js';
import logger from '../config/logger.js';
import { request } from 'express';
import { SNS } from '@aws-sdk/client-sns';
import crypto from 'crypto';

const sns = new SNS({});

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
        
        // Generate verification token and set expiry
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        // Log token creation details
        logger.info('Creating verification token:', {
            token: verificationToken,
            expiry: tokenExpiry,
            currentTime: new Date()
        });
        
        const user = await User.create({
            ...userData,
            verified: false,
            verification_token: verificationToken,
            token_expiry: tokenExpiry
        });

        // Verify token was stored correctly
        const createdUser = await User.findByPk(user.id);
        logger.info('Verification token stored:', {
            storedToken: createdUser.verification_token,
            storedExpiry: createdUser.token_expiry
        });

        const verificationUrl = `${process.env.API_BASE_URL}/v1/user/verify/${user.id}?token=${verificationToken}`;

        try {
            await sns.publish({
                TopicArn: process.env.SNS_TOPIC_ARN,
                Message: JSON.stringify({
                    email: user.email,
                    firstName: user.first_name,
                    verificationUrl: verificationUrl
                })
            });
            
            logger.info(`Verification email triggered for user: ${user.id}`);
        } catch (snsError) {
            logger.error(`Failed to publish to SNS: ${snsError.message}`);
        }

        const { password, verification_token, token_expiry, ...userWithoutPassword } = user.get({ plain: true });
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        if(error.name === "SequelizeValidationError"){
            logger.error(`Error creating user: ${error.message}`);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(400).send();
        }
        else{
            logger.error(`Error creating user: ${error.message}`);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(500).send();
        }
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const userId = req.params.userId;
        
        if (!token || !userId) {
            logger.info('Missing token or userId');
            return res.status(400).send();
        }

        const user = await User.findByPk(userId);
        
        if (!user) {
            logger.info('User not found');
            return res.status(404).send();
        }

        // Add debug logging
        logger.info('Verification attempt:', {
            providedToken: token,
            storedToken: user.verification_token,
            tokenExpiry: user.token_expiry,
            currentTime: new Date(),
            isExpired: user.token_expiry ? new Date() > new Date(user.token_expiry) : true
        });

        // First check if tokens match
        if (user.verification_token !== token) {
            logger.info('Token mismatch');
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        // Then check expiration
        if (!user.token_expiry || new Date() > new Date(user.token_expiry)) {
            logger.info('Token expired');
            return res.status(400).json({ message: 'Verification link has expired' });
        }

        // If we get here, token is valid and not expired
        await user.update({
            verified: true,
            verification_token: null,
            token_expiry: null
        });

        logger.info('User verified successfully');
        res.status(200).send();
    } catch (error) {
        logger.error(`Error verifying email: ${error.message}`);
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

        if (req.method === 'GET') {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(200).json({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                verified: user.verified,
                account_created: user.account_created,
                account_updated: user.account_updated
            });
        } else {
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
        if(error.name === "SequelizeValidationError"){
            logger.error(`Error creating user: ${error.message}`);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(400).send();
        }
        else {
            logger.error(`Error updating user: ${error.message}`);
            res.status(500).send();
        }
    }
};