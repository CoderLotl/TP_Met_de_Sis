// Req 2 — Agente: IP que informa el equipo (CP-12).
// Necesita las dependencias del agente instaladas (cd client && bun install).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import { Heartbeat } from '../client/src/services/Heartbeat.js';

const localIps = Object.values(os.networkInterfaces()).flat()
    .filter(iface => iface.family === 'IPv4' && !iface.internal)
    .map(iface => iface.address);

describe('Agente — IP informada', () =>
{
    const heartbeat = new Heartbeat();

    it('CP-12 la IP informada es la de la placa que llega al servidor', async (t) =>
    {
        const ip = await heartbeat.getRouteIp('http://localhost:3000');
        if(ip === null)
        {
            return t.skip('el equipo no tiene ruta de red por defecto');
        }

        assert.ok(localIps.includes(ip), `${ip} debería ser una IP de este equipo`);
        // Con el servidor en la LAN, la ruta hacia esa IP sale por la misma placa.
        assert.equal(await heartbeat.getRouteIp(`http://${ip}:3000`), ip);
    });

    it('CP-12b URL de servidor inválida: no rompe y devuelve null', async () =>
    {
        assert.equal(await heartbeat.getRouteIp('esto no es una url'), null);
    });

    it('CP-12c respaldo: getFirstIp devuelve una IPv4 no interna', (t) =>
    {
        if(localIps.length === 0)
        {
            return t.skip('el equipo no tiene placas de red');
        }
        assert.ok(localIps.includes(heartbeat.getFirstIp()));
    });
});
