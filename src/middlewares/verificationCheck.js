import User from '../models/index.js';
import logger from '../config/logger.js';

export const checkVerification = async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { email: req.auth.user } 
        });

        if (!user) {
            logger.info('User not found during verification check');
            return res.status(404).send();
        }

        if (!user.verified) {
            logger.info('Unverified user attempting to access protected endpoint');
            return res.status(403).send()
        }

        next();
    } catch (error) {
        logger.error(`Error in verification check: ${error.message}`);
        res.status(500).send();
    }
};