import fs from 'fs';

export class Logger
{
    static log(message, logFilePath = 'logs.txt')
    {
        const logMessage = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(logFilePath, logMessage);
    }
}