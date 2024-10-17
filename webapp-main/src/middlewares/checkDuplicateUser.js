import User from '../models/index.js';
import logger from '../config/logger.js';

export const checkDuplicateEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            logger.info(`Attempt to create user with duplicate email: ${email}`);
            return res.status(400).send();
        }
        next();
    } catch (error) {
        logger.error(`Error checking for duplicate email: ${error.message}`);
        res.status(500).send();
    }
};
