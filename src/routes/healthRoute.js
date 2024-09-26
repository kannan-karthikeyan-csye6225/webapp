import express from 'express';
import { checkHealth, methodNotAllowed } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', checkHealth);
router.all('/', methodNotAllowed);

export default router;
