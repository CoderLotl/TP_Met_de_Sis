// Req 5 — Gestionar permisos y registrar la actividad
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, ADMIN } from './helpers/server.js';
import { PERMISSIONS } from '../api/constants/Permissions.js';

describe('Req 5 — Gestionar permisos y registrar la actividad', () =>
{
    let server, admin, adminId, operadorId;
    const count = (table) => server.db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;

    before(async () =>
    {
        server = await startServer();
        admin = (await server.login(ADMIN.user, ADMIN.password)).cookie;
        adminId = server.db.prepare('SELECT id FROM users WHERE user = ?').get(ADMIN.user).id;
        operadorId = await server.createUser(admin, 'operador1', PERMISSIONS.VIEW_DEVICES);
    });
    after(async () => { await server.stop(); });

    it('CP-23 usuario sin permiso "Gestionar usuarios" lista usuarios', async () =>
    {
        const cookie = (await server.login('operador1', 'Prueba1234')).cookie;
        assert.equal((await server.req('GET', '/user', null, cookie)).status, 403);
        assert.equal((await server.req('GET', '/devices', null, cookie)).status, 200, 'sí puede ver equipos');
    });

    it('CP-24 quitarse a sí mismo el permiso de gestión', async () =>
    {
        const r = await server.req('PATCH', `/user/${adminId}`, { permissionKey: PERMISSIONS.VIEW_DEVICES }, admin);
        assert.equal(r.status, 400);

        const key = server.db.prepare('SELECT permissionKey FROM users WHERE id = ?').get(adminId).permissionKey;
        assert.equal(key & PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_USERS);
    });

    it('CP-25 registro de acciones administrativas', async () =>
    {
        const before = count('action_logs');
        await server.req('PATCH', `/user/${operadorId}`, { status: 'active' }, admin);

        assert.equal(count('action_logs'), before + 1);
        const last = server.db.prepare('SELECT method, endpoint, userId FROM action_logs ORDER BY id DESC LIMIT 1').get();
        assert.equal(last.method, 'PATCH');
        assert.equal(last.endpoint, `/user/${operadorId}`);
        assert.equal(last.userId, adminId);
    });

    it('CP-25b el alta de usuarios también queda registrada', async () =>
    {
        const before = count('action_logs');
        await server.createUser(admin, 'operador2');

        const last = server.db.prepare('SELECT method, endpoint FROM action_logs ORDER BY id DESC LIMIT 1').get();
        assert.equal(count('action_logs'), before + 1);
        assert.equal(last.method, 'POST');
        assert.equal(last.endpoint, '/user/register');
    });

    it('CP-26 registro del historial de inicios de sesión', async () =>
    {
        const before = count('login_history');
        await server.login('operador1', 'Prueba1234');
        assert.equal(count('login_history'), before + 1);
    });
});
