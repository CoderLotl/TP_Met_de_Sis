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

router.get('/app_name', (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, 'Monitor de Equipos');
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
    return ResponseManager.ReturnResponse(req, res, {
        userId: req.userId,
        user: req.user.user,
        permissionKey: req.user.permissionKey
    });
});

userRouter.get('/', requireAuth(sessionsManager), requirePermission(PERMISSIONS.MANAGE_USERS), (req, res) =>
{
    return UsersManager.listUsers(req, res);
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

// Fallback SPA: cualquier otro GET no capturado arriba sirve el front,
// para que recargar una ruta profunda (ej. /home) en producción no 404ee.
router.get('/*splat', (req, res) =>
{
    return MainManager.ReturnToFront(req, res);
});

export default router;
