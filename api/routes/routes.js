import express from 'express';
import { ResponseManager } from '../services/ResponseManager.js';

const router = express.Router();

router.get('/test', (req, res) =>
{
    return ResponseManager.ReturnResponse(req, res, 'Server online.');
});

export default router;