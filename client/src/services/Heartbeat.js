import fs from 'fs';
import path from 'path';
import { DataAccessFetch } from './DataAccessFetch.js';
import os from 'os';
import dgram from 'dgram';
import osUtils from 'os-utils';
import diskusage from 'diskusage';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Heartbeat
{
    // IP que el sistema operativo usa para llegar al servidor. Con varias placas
    // (VirtualBox, VPN, etc.) "la primera IPv4" puede no ser la de la red real.
    // Un connect UDP no envía paquetes: sólo le pide la ruta al sistema.
    getRouteIp(serverUrl)
    {
        return new Promise((resolve) =>
        {
            const socket = dgram.createSocket('udp4');
            let done = false;
            const finish = (ip) => { if(done) return; done = true; socket.close(); resolve(ip); };
            socket.once('error', () => finish(null));

            try
            {
                let host = new URL(serverUrl).hostname;
                // Si el servidor corre en esta misma PC, se usa la ruta por defecto.
                if(host === 'localhost' || host.startsWith('127.') || host === '[::1]')
                {
                    host = '8.8.8.8';
                }

                socket.connect(9, host, () => finish(socket.address().address));
            }
            catch(error)
            {
                finish(null);
            }
        });
    }

    getFirstIp()
    {
        const inferfaces = os.networkInterfaces();
        for(const name of Object.keys(inferfaces))
        {
            for(const iface of inferfaces[name])
            {
                if(iface.family === 'IPv4' && !iface.internal)
                {
                    return iface.address;
                }
            }
        }
    }

    getExistingVolumes()
    {
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        let existingVolumes = [];

        letters.forEach(letter =>
        {
            if(fs.existsSync(`${letter}:\\`))
            {
                existingVolumes.push(letter);
            }
        });

        return existingVolumes;
    }

    getVolumesStats(existingVolumes)
    {
        let volumeStats = [];
        existingVolumes.forEach(volume =>
        {
            try
            {
                let stats = diskusage.checkSync(`${volume}:/`);
                volumeStats.push(
                    {
                        volumeLetter: volume,
                        stats
                    }
                )
            }
            catch(error)
            {

            }
        });

        return volumeStats;
    }

    async beat()
    {
        let dataAccessFetch = new DataAccessFetch();
        let existingVolumes = this.getExistingVolumes();

        const configPath = path.join(path.dirname(process.execPath), 'config.json');
        let config;
        try{ config = JSON.parse(fs.readFileSync(configPath, 'utf8'));} catch(error){ config = { serverUrl: '' }; }        
        const SERVER_URL = config.serverUrl;

        // config.json puede fijar la IP a mano ("ip": "192.168.0.10"); si no, se detecta.
        let localIp = config.ip || null;
        let ipResolved = Boolean(localIp);

        do
        {
            if(SERVER_URL == '')
            {
                console.log('No server URL configured. Please set the SERVER_URL in config.json.');
                await delay(1000);
            }
            else
            {
                if(!ipResolved)
                {
                    let routeIp = await this.getRouteIp(SERVER_URL);
                    ipResolved = Boolean(routeIp);
                    localIp = routeIp || this.getFirstIp();
                }

                let data =
                {
                    ip: localIp,
                    name: os.hostname(),
                    uptime: os.uptime(),
                    totalmem: os.totalmem(),
                    freemem: os.freemem(),
                    cpu: await new Promise((resolve) => osUtils.cpuUsage(resolve)),
                    disks: this.getVolumesStats(existingVolumes)
                }

                let serverResponse = await dataAccessFetch.postData(`${SERVER_URL}/devices/heartbeat`, data);
                if(!serverResponse || !serverResponse.success)
                {
                    console.log('Server is down or unreachable.');
                }
                else
                {
                    console.log('Server is up and running.');
                }
            }            
        }while(true);
    }
}