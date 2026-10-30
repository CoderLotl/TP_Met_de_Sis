// Req 2 — Recibir el reporte de estado de los equipos
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, sleep, ADMIN } from './helpers/server.js';

const heartbeat = { name: 'PC-PRUEBA-01', ip: '10.0.0.50', uptime: 3600, totalmem: 8589934592, freemem: 4294967296, cpu: 0.25, disks: [] };

describe('Req 2 — Recibir el reporte de estado de los equipos', () =>
{
    let server, admin;
    const listDevices = async () => (await server.req('GET', '/devices', null, admin)).json.response;

    before(async () =>
    {
        server = await startServer();
        admin = (await server.login(ADMIN.user, ADMIN.password)).cookie;
    });
    after(async () => { await server.stop(); });

    it('CP-07 primer reporte de un equipo nuevo', async () =>
    {
        const r = await server.req('POST', '/devices/heartbeat', heartbeat);
        assert.equal(r.status, 200);

        const device = (await listDevices()).find(d => d.name === heartbeat.name);
        assert.ok(device, 'el equipo debería aparecer en GET /devices');
        assert.equal(device.ip, heartbeat.ip);
    });

    it('CP-08 reporte posterior del mismo equipo', async () =>
    {
        const before = (await listDevices()).find(d => d.name === heartbeat.name);
        await sleep(1100);
        await server.req('POST', '/devices/heartbeat', { ...heartbeat, freemem: 2147483648, cpu: 0.8 });

        const devices = (await listDevices()).filter(d => d.name === heartbeat.name);
        assert.equal(devices.length, 1, 'no debe duplicar el equipo');
        assert.equal(devices[0].cpu, 0.8);
        assert.equal(devices[0].freemem, 2147483648);
        assert.equal(devices[0].firstBeat, before.firstBeat);
        assert.notEqual(devices[0].lastUpdate, before.lastUpdate);
    });

    it('CP-09 reporte sin nombre de equipo', async () =>
    {
        const r = await server.req('POST', '/devices/heartbeat', { ip: '10.0.0.51' });
        assert.equal(r.status, 400);
        assert.equal(r.json.response, 'Device name is required');
    });

    it('CP-10 consulta de equipos sin sesión', async () =>
    {
        assert.equal((await server.req('GET', '/devices')).status, 401);
    });

    it('CP-11 consulta de equipos sin permiso "Ver equipos"', async () =>
    {
        await server.createUser(admin, 'sinpermisos1');
        const cookie = (await server.login('sinpermisos1', 'Prueba1234')).cookie;
        assert.equal((await server.req('GET', '/devices', null, cookie)).status, 403);
    });
});
