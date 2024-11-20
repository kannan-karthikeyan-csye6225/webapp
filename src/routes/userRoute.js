import express from 'express';
import { createUser, getUser, updateUser, verifyEmail } from '../controllers/userController.js';
import { uploadProfilePic, deleteProfilePic, getProfilePic } from '../controllers/profilePicController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import basicAuthMiddleware from '../middlewares/basicAuth.js';
import { checkPayload } from '../middlewares/checkPayload.js';
import { checkDuplicateEmail } from '../middlewares/checkDuplicateUser.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { validateProfilePicUpload, validateProfilePicGet, validateProfilePicDelete } from '../middlewares/validateRequest.js';
import { metricMiddleware } from '../middlewares/metricMiddleware.js';
import { checkVerification } from '../middlewares/verificationCheck.js';

const router = express.Router();

router
    .route('/')
    .post(metricMiddleware, checkDuplicateEmail, createUser)
    .all(methodNotAllowed);

router
    .route('/verify')
    .get(verifyEmail)
    .all(methodNotAllowed);

router
    .route('/self')
    .get(metricMiddleware, checkPayload, basicAuthMiddleware, checkVerification, getUser)
    .put(metricMiddleware, basicAuthMiddleware, checkVerification, checkPayload, updateUser)
    .all(methodNotAllowed);

router
    .route('/self/pic')
    .post(basicAuthMiddleware, checkVerification, handleUpload, uploadProfilePic)
    .get(basicAuthMiddleware, checkVerification, validateProfilePicGet, getProfilePic)
    .delete(basicAuthMiddleware, checkVerification, validateProfilePicDelete, deleteProfilePic)
    .all(methodNotAllowed);

router.use(errorHandler);

export default router;