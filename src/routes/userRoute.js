import express from 'express';
import { createUser, getUser } from '../controllers/userController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import basicAuthMiddleware from '../middlewares/basicAuth.js';

const router = express.Router();

router
    .route('/')
    .post(createUser)
    .get(basicAuthMiddleware, getUser)
    .all(methodNotAllowed)

export default router;