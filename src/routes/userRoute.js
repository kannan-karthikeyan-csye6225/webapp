import express from 'express';
import { createUser, getUser, updateUser } from '../controllers/userController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import basicAuthMiddleware from '../middlewares/basicAuth.js';
import { checkPayload } from '../middlewares/checkPayload.js';
import { checkDuplicateEmail } from '../middlewares/checkDuplicateUser.js';

const router = express.Router();

router
    .route('/')
    .post(checkDuplicateEmail, createUser)
    .get(checkPayload, basicAuthMiddleware, getUser)
    .put(basicAuthMiddleware, checkPayload, updateUser)
    .all(methodNotAllowed)

export default router;