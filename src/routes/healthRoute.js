import express from 'express';
import { checkHealth } from '../controllers/healthController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = express.Router();

// router.all('/', checkHealth);

router
    .route('/')
    .get(checkHealth)
    .all(methodNotAllowed)


export default router;