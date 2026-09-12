import fs from 'fs';
import path from 'path';
import { DataAccessFetch } from './DataAccessFetch.js';
import os from 'os';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Heartbeat
{
    getLocalIp()
    {
        const inferfaces = os.networkInterfaces();
        for (const name of Object.keys(inferfaces))
        {
            for (const iface of inferfaces[name])
            {
                if (iface.family === 'IPv4' && !iface.internal)
                {
                    return iface.address;
                }
            }
        }
    }

    async beat()
    {
        let dataAccessFetch = new DataAccessFetch();
        let localIp = this.getLocalIp();

        const configPath = path.join(path.dirname(process.execPath), 'config.json');
        let config;
        try{ config = JSON.parse(fs.readFileSync(configPath, 'utf8'));} catch(error){ config = { serverUrl: '' }; }        
        const SERVER_URL = config.serverUrl;

        do
        {
            if(SERVER_URL == '')
            {
                console.log('No server URL configured. Please set the SERVER_URL in config.js');            
            }
            else
            {
                let serverResponse = await dataAccessFetch.postData(`${SERVER_URL}/heartbeat`, { ip: localIp });
                if(!serverResponse || !serverResponse.success)
                {
                    console.log('Server is down or unreachable.');
                }
                else
                {
                    console.log('Server is up and running.');
                }
            }
    
            await delay(1000);
        }while(true);
    }
}