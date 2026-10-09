import { ResponseManager } from "../services/ResponseManager.js";
import { DataAccess } from "../services/DataAccess.js";
import { Logger } from "../services/Logger.js";
import bcrypt from 'bcryptjs';
import path from 'path';

export class MainManager
{
    static ReturnToFront(req, res)
    {
        // path.resolve arranca desde el directorio raíz del proyecto.
        res.sendFile(path.resolve('./front/dist/index.html'));
    }

    static async RegisterUser(req, res)
    {
        let params = ResponseManager.GetRequest(req);

        let user = params['user'];
        let mail = params['mail'];
        let password = params['password'];        

        try
        {
            let matchingUser = DataAccess.select('users', ['user'], ['user'], [user]);
            let matchingMail = DataAccess.select('users', ['mail'], ['mail'], [mail]);

            if(matchingUser.length > 0 || matchingMail.length > 0)
            {
                return ResponseManager.ReturnResponse(req, res, 'User or mail already exists', 400);
            }

            let hashedPassword = await bcrypt.hash(password, 10);
            let registered = new Date().toISOString();
            let status = 'active';
            let permissionKey = 0;

            let columns = ['user', 'mail', 'password', 'registered', 'status', 'permissionKey'];
            let values = [user, mail, hashedPassword, registered, status, permissionKey];

            DataAccess.insert('users', columns, values);
            return ResponseManager.ReturnResponse(req, res, 'User registered successfully', 200);
        }
        catch(error)
        {
            Logger.log(`Error registering user: ${error.message}`);
            return ResponseManager.ReturnResponse(req, res, 'Error registering user', 500);
        }
    }

    static async loginUser(req, res)
    {
        
    }
}