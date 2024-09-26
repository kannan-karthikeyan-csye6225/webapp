import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 3000;
app.use('/healthz', healthRoutes);

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}`);
});
