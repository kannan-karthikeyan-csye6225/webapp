import express from 'express';
import { createUser } from '../controllers/userController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = express.Router();

router
    .route('/')
    .post(createUser)
    .all(methodNotAllowed)

export default router;