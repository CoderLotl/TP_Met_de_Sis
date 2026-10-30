// Req 1 — Autenticar usuario
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, ADMIN } from './helpers/server.js';
import { PERMISSIONS } from '../api/constants/Permissions.js';

describe('Req 1 — Autenticar usuario', () =>
{
    let server;
    before(async () => { server = await startServer(); });
    after(async () => { await server.stop(); });

    it('CP-01 inicio de sesión con credenciales válidas', async () =>
    {
        const r = await server.login(ADMIN.user, ADMIN.password);
        assert.equal(r.status, 200);
        assert.match(r.cookie, /^session_id=/);
    });

    it('CP-02 inicio de sesión con contraseña incorrecta', async () =>
    {
        const r = await server.login(ADMIN.user, 'incorrecta');
        assert.equal(r.status, 401);
        assert.equal(r.json.response, 'Invalid credentials');
    });

    it('CP-03 inicio de sesión con campos vacíos', async () =>
    {
        const r = await server.login('', '');
        assert.equal(r.status, 400);
    });

    it('CP-04 acceso a un recurso protegido sin sesión', async () =>
    {
        const r = await server.req('GET', '/user/me');
        assert.equal(r.status, 401);
    });

    it('CP-05 uso de la sesión después de cerrar sesión', async () =>
    {
        const { cookie } = await server.login(ADMIN.user, ADMIN.password);
        assert.equal((await server.req('GET', '/user/me', null, cookie)).status, 200);

        await server.req('POST', '/user/logout', null, cookie);
        assert.equal((await server.req('GET', '/user/me', null, cookie)).status, 401);
    });

    it('CP-06 usuario baneado: no puede ingresar y pierde la sesión abierta', async () =>
    {
        const admin = (await server.login(ADMIN.user, ADMIN.password)).cookie;
        const id = await server.createUser(admin, 'baneado1', PERMISSIONS.VIEW_DEVICES);
        const previous = (await server.login('baneado1', 'Prueba1234')).cookie;

        await server.req('PATCH', `/user/${id}`, { status: 'banned' }, admin);

        assert.equal((await server.login('baneado1', 'Prueba1234')).status, 401);
        const reuse = await server.req('GET', '/user/me', null, previous);
        assert.equal(reuse.status, 401);
        assert.equal(reuse.json.forceLogout, true);
    });
});
