import basicAuth from 'express-basic-auth';
import bcrypt from 'bcrypt';
import User from '../models/index.js';
import logger from '../config/logger.js';

const basicAuthMiddleware = basicAuth({
    authorizeAsync: true,
    authorizer: async (username, password, cb) => {
        try {
            const user = await User.findOne({ where: { email: username } });

            if (!user) {
                logger.info("User cannot be found - Basic Auth is unable to find the email provided")
                return cb(null, false); 
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            logger.info("Password matches!")

            return cb(null, isPasswordValid); 

        } catch (error) {
            logger.info("Auth error! - Check basicAuth.js file")
            return cb(null, false);
        }
    },
    // unauthorizedResponse: { message: 'Unauthorized' }
    challenge: true 
});

export default basicAuthMiddleware;
