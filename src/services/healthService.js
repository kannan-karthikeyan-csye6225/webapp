import sequelize from '../config/database.js';
import logger from '../config/logger.js';

const checkDatabaseHealth = async() => {
    try {
        await sequelize.authenticate()
        logger.info('Postgres Database connection successful')
        return true
    } catch (error) {
        logger.info('Postgres Database connection unsuccessful')
        return false
    }
}

export default checkDatabaseHealth