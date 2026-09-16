import { ResponseManager } from "../services/ResponseManager.js";
import path from 'path';

export class MainManager
{
    static ReturnToFront(req, res)
    {
        // path.resolve arranca desde el directorio raíz del proyecto.
        res.sendFile(path.resolve('./front/dist/index.html'));
    }
}