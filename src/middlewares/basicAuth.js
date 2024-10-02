import basicAuth from 'express-basic-auth';
import bcrypt from 'bcrypt';
import User from '../models/index.js';

const basicAuthMiddleware = basicAuth({
    authorizeAsync: true,  // Enable async support for bcrypt comparison
    authorizer: async (username, password, cb) => {
        try {
            // Find the user by email (username is email in this case)
            const user = await User.findOne({ where: { email: username } });
            
            if (!user) {
                return cb(null, false);  // User not found
            }

            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);

            return cb(null, isPasswordValid);  // Return true if valid, false otherwise
        } catch (error) {
            return cb(null, false);  // Handle any errors during the process
        }
    },
    // unauthorizedResponse: { message: 'Unauthorized' },  // Response for unauthorized access
    challenge: true  // Will challenge for credentials if none are provided
});

export default basicAuthMiddleware;
