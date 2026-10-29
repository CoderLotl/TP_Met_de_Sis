import crypto from 'node:crypto';

// Sin límite de tiempo: una sesión solo termina por logout explícito o porque el
// backend se reinicia (las sesiones viven en memoria, no en la base). Esta constante
// es nada más la duración de la cookie en el navegador, no un timeout de sesión.
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

// Usado tanto al loguear como en cada request autenticado (ver AuthMiddleware.requireAuth),
// para que la cookie sobreviva a cerrar el navegador y se renueve en cada uso.
export function setSessionCookie(res, sessionId)
{
    res.cookie('session_id', sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE_MS
    });
}

export class SessionsManager
{
    sessions;

    constructor()
    {
        this.sessions = new Map();
    }

    createSession(userId)
    {
        const sessionId = crypto.randomBytes(32).toString('hex');

        this.sessions.set(sessionId, {
            userId,
            createdAt: Date.now()
        });

        return sessionId;
    }

    getSession(sessionId)
    {
        return this.sessions.get(sessionId);
    }

    destroySession(sessionId)
    {
        return this.sessions.delete(sessionId);
    }
}
