import { Heartbeat } from './src/services/Heartbeat.js';

Bun.serve(
    {
        port: 4000,
        fetch(req)
        {
            return new Response("ok");
        },
    }
);

let heartbeat = new Heartbeat();
heartbeat.beat();