import User from "../models/index.js";
import logger from "../config/logger.js";

// User creation
export const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const user = await User.create({ firstName, lastName, email, password }); // User.create takes care of building the user and saving it to the DB
        logger.info('User created successfully');
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).send();
    }
};