import fs from 'fs';
import path from 'path';
import { DataAccessFetch } from './DataAccessFetch.js';
import os from 'os';
import osUtils from 'os-utils';
import diskusage from 'diskusage';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Heartbeat
{
    getLocalIp()
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
        let localIp = this.getLocalIp();
        let existingVolumes = this.getExistingVolumes();

        const configPath = path.join(path.dirname(process.execPath), 'config.json');
        let config;
        try{ config = JSON.parse(fs.readFileSync(configPath, 'utf8'));} catch(error){ config = { serverUrl: '' }; }        
        const SERVER_URL = config.serverUrl;

        do
        {
            if(SERVER_URL == '')
            {
                console.log('No server URL configured. Please set the SERVER_URL in config.js');
                await delay(1000);
            }
            else
            {
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