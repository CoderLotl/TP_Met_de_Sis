// Req 4 — Administrar usuarios
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, ADMIN } from './helpers/server.js';
import { PERMISSIONS } from '../api/constants/Permissions.js';

describe('Req 4 — Administrar usuarios', () =>
{
    let server, admin, adminId;
    const userRow = (user) => server.db.prepare('SELECT * FROM users WHERE user = ?').get(user);

    before(async () =>
    {
        server = await startServer();
        admin = (await server.login(ADMIN.user, ADMIN.password)).cookie;
        adminId = userRow(ADMIN.user).id;
    });
    after(async () => { await server.stop(); });

    it('CP-15 alta de usuario con datos válidos', async () =>
    {
        const r = await server.req('POST', '/user/register', { user: 'operador1', mail: 'operador1@prueba.com', password: 'Prueba1234' }, admin);
        assert.equal(r.status, 200);
        assert.ok(userRow('operador1'));
    });

    it('CP-16 alta de usuario con nombre ya existente', async () =>
    {
        const r = await server.req('POST', '/user/register', { user: 'operador1', mail: 'otro@prueba.com', password: 'Prueba1234' }, admin);
        assert.equal(r.status, 400);
        assert.equal(r.json.response, 'User or mail already exists');
    });

    it('CP-17 alta de usuario con contraseña corta', async () =>
    {
        const r = await server.req('POST', '/user/register', { user: 'operador2', mail: 'operador2@prueba.com', password: '1234' }, admin);
        assert.equal(r.status, 400);
        assert.equal(userRow('operador2'), undefined);
    });

    it('CP-18 alta de usuario con mail inválido', async () =>
    {
        const r = await server.req('POST', '/user/register', { user: 'operador2', mail: 'sin-arroba', password: 'Prueba1234' }, admin);
        assert.equal(r.status, 400);
        assert.equal(r.json.response, 'A valid mail is required');
    });

    it('CP-19 modificación del mail de un usuario', async () =>
    {
        const r = await server.req('PATCH', `/user/${userRow('operador1').id}`, { mail: 'operador1.nuevo@prueba.com' }, admin);
        assert.equal(r.status, 200);
        assert.equal(userRow('operador1').mail, 'operador1.nuevo@prueba.com');
    });

    it('CP-20 intento de darse de baja a sí mismo', async () =>
    {
        const r = await server.req('DELETE', `/user/${adminId}`, null, admin);
        assert.equal(r.status, 400);
        assert.equal(userRow(ADMIN.user).deleted, 0);
    });

    it('CP-21 baja lógica de otro usuario', async () =>
    {
        const id = await server.createUser(admin, 'operador3');
        assert.equal((await server.login('operador3', 'Prueba1234')).status, 200);

        const r = await server.req('DELETE', `/user/${id}`, null, admin);
        assert.equal(r.status, 200);
        assert.equal(userRow('operador3').deleted, 1, 'el registro se conserva con deleted = 1');
        assert.equal((await server.login('operador3', 'Prueba1234')).status, 401);
    });

    it('CP-22 alta de usuario sin sesión iniciada', async () =>
    {
        const r = await server.req('POST', '/user/register', { user: 'anonimo1', mail: 'anonimo1@prueba.com', password: 'Prueba1234' });
        assert.equal(r.status, 401);
        assert.equal(userRow('anonimo1'), undefined);
    });

    it('CP-22b alta de usuario con sesión pero sin permiso "Gestionar usuarios"', async () =>
    {
        await server.createUser(admin, 'operador4', PERMISSIONS.VIEW_DEVICES);
        const cookie = (await server.login('operador4', 'Prueba1234')).cookie;

        const r = await server.req('POST', '/user/register', { user: 'intruso1', mail: 'intruso1@prueba.com', password: 'Prueba1234' }, cookie);
        assert.equal(r.status, 403);
        assert.equal(userRow('intruso1'), undefined);
    });
});
