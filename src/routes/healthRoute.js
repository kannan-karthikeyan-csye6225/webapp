import express from 'express';
import { checkHealth } from '../controllers/healthController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import { metricMiddleware } from '../middlewares/metricMiddleware.js';
const router = express.Router();

// router.all('/', checkHealth);

router
    .route('/')
    .get(metricMiddleware, checkHealth)
    .all(methodNotAllowed)


export default router;