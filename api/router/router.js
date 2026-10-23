import express from 'express';
import { ResponseManager } from '../services/ResponseManager.js';
import { MainManager } from '../managers/MainManager.js';
import { DevicesManager } from '../managers/DevicesManager.js';
import { SessionsManager } from '../managers/SessionsManager.js';
import { UsersManager } from '../managers/UsersManager.js';
import { requireAuth, requirePermission, logAction } from '../middlewares/AuthMiddleware.js';
import { PERMISSIONS } from '../constants/Permissions.js';

const router = express.Router();
const devicesManager = new DevicesManager();
const sessionsManager = new SessionsManager();

router.get('/test', (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, 'Server online.');
});

router.get('/', (req, res) =>
{
    return MainManager.ReturnToFront(req, res);
});

// --- /user ---
const userRouter = express.Router();

userRouter.post('/register', (req, res) =>
{
    return MainManager.RegisterUser(req, res);
});

userRouter.post('/login', (req, res) =>
{
    return MainManager.loginUser(req, res, sessionsManager);
});

userRouter.post('/logout', (req, res) =>
{
    return MainManager.logoutUser(req, res, sessionsManager);
});

userRouter.get('/me', requireAuth(sessionsManager), (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, { userId: req.userId });
});

userRouter.patch('/:id', requireAuth(sessionsManager), requirePermission(PERMISSIONS.MANAGE_USERS), logAction, (req, res) =>
{
    return UsersManager.updateUser(req, res);
});

userRouter.delete('/:id', requireAuth(sessionsManager), requirePermission(PERMISSIONS.MANAGE_USERS), logAction, (req, res) =>
{
    return UsersManager.deleteUser(req, res);
});

router.use('/user', userRouter);

// --- /devices ---
const devicesRouter = express.Router();

devicesRouter.post('/heartbeat', (req, res) =>
{
    return devicesManager.listenHeartbeat(req, res);
});

devicesRouter.get('/', requireAuth(sessionsManager), requirePermission(PERMISSIONS.VIEW_DEVICES), (req, res) =>
{
    return devicesManager.getDevicesData(req, res);
});

router.use('/devices', devicesRouter);

export default router;
