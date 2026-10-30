import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const ADMIN = { user: 'admin', password: 'admin1234' };
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getFreePort()
{
    return new Promise((resolve) =>
    {
        const probe = net.createServer();
        probe.listen(0, () =>
        {
            const port = probe.address().port;
            probe.close(() => resolve(port));
        });
    });
}

// Levanta el servidor real en un puerto libre, sobre una copia temporal de api/db/db.db.
// La base original nunca se modifica. Cada archivo de test tiene su propio servidor y su propia copia.
export async function startServer()
{
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tests-'));
    const dbPath = path.join(tmpDir, 'db.db');
    fs.copyFileSync(path.join(ROOT, 'api/db/db.db'), dbPath);

    const port = await getFreePort();
    const base = `http://localhost:${port}`;
    const child = spawn(process.execPath, ['index.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), DB_PATH: dbPath },
        stdio: 'ignore'
    });

    let ready = false;
    for(let i = 0; i < 50 && !ready; i++)
    {
        try { ready = (await fetch(`${base}/test`)).ok; } catch(error) { await sleep(100); }
    }
    if(!ready)
    {
        child.kill();
        throw new Error('El servidor de pruebas no arrancó.');
    }

    const db = new DatabaseSync(dbPath);

    async function req(method, url, body = null, cookie = null)
    {
        const headers = { 'Content-Type': 'application/json' };
        if(cookie) headers.Cookie = cookie;

        const res = await fetch(base + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
        let json = null;
        try { json = await res.json(); } catch(error) {}
        const setCookie = res.headers.get('set-cookie');

        return { status: res.status, json, cookie: setCookie ? setCookie.split(';')[0] : null };
    }

    const login = (user, password) => req('POST', '/user/login', { user, password });

    // Crea un usuario con el admin y le asigna permisos; devuelve su id.
    async function createUser(adminCookie, user, permissionKey = 0, password = 'Prueba1234')
    {
        await req('POST', '/user/register', { user, mail: `${user}@prueba.com`, password }, adminCookie);
        const id = db.prepare('SELECT id FROM users WHERE user = ?').get(user).id;
        if(permissionKey)
        {
            await req('PATCH', `/user/${id}`, { permissionKey }, adminCookie);
        }
        return id;
    }

    async function stop()
    {
        db.close();
        await new Promise((resolve) =>
        {
            child.once('exit', resolve);
            child.kill();
        });
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    return { base, db, req, login, createUser, stop };
}
