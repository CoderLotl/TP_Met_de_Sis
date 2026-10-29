import { ResponseManager } from "../services/ResponseManager.js";
import { DataAccess } from "../services/DataAccess.js";
import { Logger } from "../services/Logger.js";
import { Validator } from "../services/Validator.js";
import { setSessionCookie } from "./SessionsManager.js";
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

        if(!Validator.isNonEmptyString(user))
        {
            return ResponseManager.ReturnResponse(req, res, 'User is required', 400);
        }

        if(!Validator.isValidEmail(mail))
        {
            return ResponseManager.ReturnResponse(req, res, 'A valid mail is required', 400);
        }

        if(!Validator.isValidPassword(password))
        {
            return ResponseManager.ReturnResponse(req, res, 'Password must be at least 8 characters long', 400);
        }

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

    static async loginUser(req, res, sessionsManager)
    {
        let params = ResponseManager.GetRequest(req);

        let user = params['user'];
        let password = params['password'];

        if(!Validator.isNonEmptyString(user) || !Validator.isNonEmptyString(password))
        {
            return ResponseManager.ReturnResponse(req, res, 'User and password are required', 400);
        }

        try
        {
            let matchingUsers = DataAccess.select('users', [], ['user'], [user]);

            if(matchingUsers.length === 0)
            {
                return ResponseManager.ReturnResponse(req, res, 'Invalid credentials', 401);
            }

            let foundUser = matchingUsers[0];

            if(foundUser.deleted || foundUser.status === 'banned')
            {
                return ResponseManager.ReturnResponse(req, res, 'Invalid credentials', 401);
            }

            let passwordMatches = await bcrypt.compare(password, foundUser.password);

            if(!passwordMatches)
            {
                return ResponseManager.ReturnResponse(req, res, 'Invalid credentials', 401);
            }

            let sessionId = sessionsManager.createSession(foundUser.id);

            setSessionCookie(res, sessionId);

            DataAccess.insert('login_history', ['userId', 'clientIp', 'userAgent', 'lang', 'createdAt'],
            [
                foundUser.id,
                req.ip,
                req.get('User-Agent') || null,
                req.get('Accept-Language') || null,
                new Date().toISOString()
            ]);

            return ResponseManager.ReturnResponse(req, res, 'Login successful', 200);
        }
        catch(error)
        {
            Logger.log(`Error logging in user: ${error.message}`);
            return ResponseManager.ReturnResponse(req, res, 'Error logging in', 500);
        }
    }

    static logoutUser(req, res, sessionsManager)
    {
        let sessionId = req.cookies['session_id'];

        if(sessionId)
        {
            sessionsManager.destroySession(sessionId);
        }

        res.clearCookie('session_id');
        return ResponseManager.ReturnResponse(req, res, 'Logout successful', 200);
    }
}