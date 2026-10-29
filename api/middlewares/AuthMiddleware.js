import { ResponseManager } from "../services/ResponseManager.js";
import { DataAccess } from "../services/DataAccess.js";
import { setSessionCookie } from "../managers/SessionsManager.js";

export function requireAuth(sessionsManager)
{
    return (req, res, next) =>
    {
        let sessionId = req.cookies['session_id'];
        let session = sessionId ? sessionsManager.getSession(sessionId) : undefined;

        if(!session)
        {
            return ResponseManager.ReturnResponse(req, res, 'Not authenticated', 401);
        }

        let matchingUsers = DataAccess.select('users', [], ['id'], [session.userId]);

        if(matchingUsers.length === 0 || matchingUsers[0].deleted)
        {
            sessionsManager.destroySession(sessionId);
            return ResponseManager.ReturnResponse(req, res, 'Not authenticated', 401);
        }

        if(matchingUsers[0].status === 'banned')
        {
            sessionsManager.destroySession(sessionId);
            return res.status(401).json({ response: 'This account has been banned.', forceLogout: true });
        }

        setSessionCookie(res, sessionId);
        req.userId = session.userId;
        req.user = matchingUsers[0];
        next();
    };
}

// Debe usarse siempre después de requireAuth, ya que depende de req.user.
export function requirePermission(permissionKey)
{
    return (req, res, next) =>
    {
        if((permissionKey & req.user.permissionKey) !== permissionKey)
        {
            return ResponseManager.ReturnResponse(req, res, "You don't have enough rights for this.", 403);
        }

        next();
    };
}

// Debe usarse siempre después de requireAuth, ya que depende de req.userId.
export function logAction(req, res, next)
{
    DataAccess.insert('action_logs', ['userId', 'endpoint', 'method', 'clientIp', 'userAgent', 'lang', 'createdAt'],
    [
        req.userId,
        req.originalUrl,
        req.method,
        req.ip,
        req.get('User-Agent') || null,
        req.get('Accept-Language') || null,
        new Date().toISOString()
    ]);

    next();
}
