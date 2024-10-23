import express from 'express';
import dotenv from 'dotenv';
import logger from './src/config/logger.js';
import healthRoute from './src/routes/healthRoute.js';
import userRoute from './src/routes/userRoute.js'; 

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 3000;
app.use('/healthz', healthRoute);
app.use('/v2/user', userRoute);

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}`);
});
