import express from 'express';
import { ResponseManager } from '../services/ResponseManager.js';
import { MainManager } from '../managers/MainManager.js';

const router = express.Router();

router.get('/test', (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, 'Server online.');
});

router.get('/', (req, res) =>
{
    return MainManager.ReturnToFront(req, res);
});

export default router;