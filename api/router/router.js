import express from 'express';
import { ResponseManager } from '../services/ResponseManager.js';
import { MainManager } from '../managers/MainManager.js';
import { DevicesManager } from '../managers/DevicesManager.js';
import { Device } from '../classes/Device.js';

const router = express.Router();
const devicesManager = new DevicesManager();

router.get('/test', (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, 'Server online.');
});

router.get('/', (req, res) =>
{
    return MainManager.ReturnToFront(req, res);
});

router.post('/heartbeat', (req, res)=>
{
    return devicesManager.listenHeartbeat(req, res);
});

export default router;