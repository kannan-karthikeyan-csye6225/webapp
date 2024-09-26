import express from 'express';
import { checkHealth } from '../controllers/healthController.js';

const router = express.Router();

router.all('/', checkHealth);

export default router;