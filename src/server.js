import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import healthRoute from './routes/healthRoute.js';
import userRoute from './routes/userRoute.js'; 

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 3000;
app.use('/healthz', healthRoute);
app.use('/v1/user', userRoute);

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}`);
});
