import { Device } from "../classes/Device.js";
import { ResponseManager } from "../services/ResponseManager.js";
import { Validator } from "../services/Validator.js";
import path from 'path';

export class DevicesManager
{
    devices;

    constructor()
    {
        this.devices = new Map();
    }

    // - - - - - - - - - - - - - - - -

    insertNewDevice(dateTime, deviceData = [])
    {
        const newDevice = new Device(dateTime, deviceData);
        this.devices.set(deviceData.name, newDevice);
    }

    searchDevice(deviceName)
    {
        return this.devices.has(deviceName);
    }

    modifyDevice(deviceName, keys, values, dateTime)
    {
        if(this.searchDevice(deviceName))
        {
            const device = this.devices.get(deviceName);

            if(Array.isArray(keys) && Array.isArray(values))
            {                
                keys.forEach((key, index) =>
                {
                    device[key] = values[index];
                });            
            }
            else
            {
                device[keys] = values;
            }

            device.lastUpdate = dateTime;
            return true;
        }

        return false;
    }

    // - - - - - - - - - - - - - - - -

    listenHeartbeat(req, res)
    {
        let deviceData = ResponseManager.GetRequest(req);

        if(!Validator.isNonEmptyString(deviceData.name))
        {
            return ResponseManager.ReturnResponse(req, res, 'Device name is required', 400);
        }

        const dateTime = new Date();

        if(this.searchDevice(deviceData.name))
        {
            const deviceKeys = Object.keys(deviceData);
            const deviceValues = Object.values(deviceData);

            this.modifyDevice(deviceData.name, deviceKeys, deviceValues, dateTime);            
        }
        else
        {
            this.insertNewDevice(dateTime, deviceData);
        }
        
        return ResponseManager.ReturnResponse(req, res, '');
    }

    getDevicesData(req, res)
    {
        return ResponseManager.ReturnResponse(req, res, Array.from(this.devices.values()));
    }
}