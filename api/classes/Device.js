export class Device
{
    constructor(dateTime, data)
    {
        this.name = data.name;
        this.ip = data.ip;
        this.uptime = data.uptime;
        this.lastUpdate = dateTime;
        this.firstBeat = dateTime;
        this.totalmem = data.totalmem;
        this.freemem = data.freemem;
    }
}