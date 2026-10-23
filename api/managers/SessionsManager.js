import crypto from 'node:crypto';

export const SESSION_DURATION_MS = 30 * 60 * 1000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

export class SessionsManager
{
    sessions;

    constructor()
    {
        this.sessions = new Map();
        setInterval(() => this.sweepExpiredSessions(), SWEEP_INTERVAL_MS);
    }

    createSession(userId)
    {
        const sessionId = crypto.randomBytes(32).toString('hex');

        this.sessions.set(sessionId, {
            userId,
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS
        });

        return sessionId;
    }

    getSession(sessionId)
    {
        const session = this.sessions.get(sessionId);

        if(!session)
        {
            return undefined;
        }

        if(session.expiresAt < Date.now())
        {
            this.sessions.delete(sessionId);
            return undefined;
        }

        return session;
    }

    touchSession(sessionId)
    {
        const session = this.getSession(sessionId);

        if(!session)
        {
            return false;
        }

        session.expiresAt = Date.now() + SESSION_DURATION_MS;
        return true;
    }

    destroySession(sessionId)
    {
        return this.sessions.delete(sessionId);
    }

    sweepExpiredSessions()
    {
        const now = Date.now();

        for(const [sessionId, session] of this.sessions)
        {
            if(session.expiresAt < now)
            {
                this.sessions.delete(sessionId);
            }
        }
    }
}