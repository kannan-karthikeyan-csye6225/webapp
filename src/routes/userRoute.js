import express from 'express';
import { createUser, getUser, updateUser } from '../controllers/userController.js';
import { uploadProfilePic, deleteProfilePic, getProfilePic } from '../controllers/profilePicController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import basicAuthMiddleware from '../middlewares/basicAuth.js';
import { checkPayload } from '../middlewares/checkPayload.js';
import { checkDuplicateEmail } from '../middlewares/checkDuplicateUser.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { validateProfilePicUpload, validateProfilePicGet, validateProfilePicDelete } from '../middlewares/validateRequest.js';

const router = express.Router();

router
    .route('/')
    .post(checkDuplicateEmail, createUser)
    .all(methodNotAllowed);

router
    .route('/self')
    .get(checkPayload, basicAuthMiddleware, getUser)
    .put(basicAuthMiddleware, checkPayload, updateUser)
    .all(methodNotAllowed);

router
    .route('/self/pic')
    .post(basicAuthMiddleware, handleUpload, uploadProfilePic)
    .get(basicAuthMiddleware, validateProfilePicGet, getProfilePic)
    .delete(basicAuthMiddleware, validateProfilePicDelete, deleteProfilePic)
    .all(methodNotAllowed);

router.use(errorHandler);

export default router;