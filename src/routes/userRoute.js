// src/routes/userRoute.js
import express from 'express';
import statsdClient from '../config/statsd.js';
import { createUser, getUser, updateUser } from '../controllers/userController.js';
import { uploadProfilePic, deleteProfilePic, getProfilePic } from '../controllers/profilePicController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';
import basicAuthMiddleware from '../middlewares/basicAuth.js';
import { checkPayload } from '../middlewares/checkPayload.js';
import { checkDuplicateEmail } from '../middlewares/checkDuplicateUser.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { validateProfilePicGet, validateProfilePicDelete } from '../middlewares/validateRequest.js';

const router = express.Router();

router
    .route('/')
    .post(async (req, res, next) => {
        const startTime = Date.now();
        await checkDuplicateEmail(req, res, next);
        await createUser(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.post_user'); // Count of POST /user
        statsdClient.timing('api.post_user.time', duration); // Timer in ms
    })
    .all(methodNotAllowed);

router
    .route('/self')
    .get(async (req, res, next) => {
        const startTime = Date.now();
        await checkPayload(req, res, next);
        await basicAuthMiddleware(req, res, next);
        await getUser(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.get_self'); // Count of GET /self
        statsdClient.timing('api.get_self.time', duration); // Timer in ms
    })
    .put(async (req, res, next) => {
        const startTime = Date.now();
        await basicAuthMiddleware(req, res, next);
        await checkPayload(req, res, next);
        await updateUser(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.put_self'); // Count of PUT /self
        statsdClient.timing('api.put_self.time', duration); // Timer in ms
    })
    .all(methodNotAllowed);

router
    .route('/self/pic')
    .post(async (req, res, next) => {
        const startTime = Date.now();
        await basicAuthMiddleware(req, res, next);
        await handleUpload(req, res, next);
        await uploadProfilePic(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.post_self_pic'); // Count of POST /self/pic
        statsdClient.timing('api.post_self_pic.time', duration); // Timer in ms
    })
    .get(async (req, res, next) => {
        const startTime = Date.now();
        await basicAuthMiddleware(req, res, next);
        await validateProfilePicGet(req, res, next);
        await getProfilePic(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.get_self_pic'); // Count of GET /self/pic
        statsdClient.timing('api.get_self_pic.time', duration); // Timer in ms
    })
    .delete(async (req, res, next) => {
        const startTime = Date.now();
        await basicAuthMiddleware(req, res, next);
        await validateProfilePicDelete(req, res, next);
        await deleteProfilePic(req, res);
        const duration = Date.now() - startTime;
        statsdClient.increment('api.delete_self_pic'); // Count of DELETE /self/pic
        statsdClient.timing('api.delete_self_pic.time', duration); // Timer in ms
    })
    .all(methodNotAllowed);

router.use(errorHandler);

export default router;
