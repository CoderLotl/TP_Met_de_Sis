<script>
    import { onMount, onDestroy } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { get } from 'svelte/store';
    import { BACK_PATH, BASE_PATH, APP_NAME } from '../lib/stores/stores.js';

    import { requireAuth, withMinDelay } from '../lib/auth.js';
    import { DataAccessFetch } from '../lib/services/DataAccessFetch.js';
    import { errorMessage, successMessage } from '../lib/services/ToastDialoguer.js';

    import Title from '../components/snippets/Page_Title.svelte';
    import Main from '../components/Main.svelte';
    import Nav from '../components/Nav.svelte';
    import Loading from '../components/snippets/Loading.svelte';
    import Equipo from '../components/snippets/Equipo.svelte';

    const dataAccess = new DataAccessFetch();
    let currentUser = null;
    let ready = false;

    // Un equipo se considera "online" si mandó un heartbeat dentro de esta ventana.
    const OFFLINE_THRESHOLD_MS = 5000;
    const POLL_INTERVAL_MS = 2000;

    $: appName = $APP_NAME;
    let comp = 'Main Board';

    $: equiposOnline = equipos.filter(equipo => equipo.status === 'online').length;
    $: equiposOffline = equipos.filter(equipo => equipo.status === 'offline').length;

    let timer = null;
    let equipos = [];
    let networkErrorShown = false;

    function formatUptime(totalSeconds)
    {
        totalSeconds = totalSeconds ?? 0;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return { hours, mins, seconds };
    }

    function bytesToMB(bytes)
    {
        return bytes != null ? Math.round(bytes / (1024 * 1024)) : 0;
    }

    function bytesToGB(bytes)
    {
        return Math.round((bytes ?? 0) / (1024 * 1024 * 1024) * 10) / 10;
    }

    function mapDisk(disk)
    {
        const total = disk.stats?.total ?? 0;
        const free = disk.stats?.free ?? 0;
        const used = Math.max(0, total - free);

        return {
            letter: disk.volumeLetter,
            usedGB: bytesToGB(used),
            totalGB: bytesToGB(total),
            percent: total > 0 ? Math.round((used / total) * 100) : 0
        };
    }

    function mapDevice(device)
    {
        const lastUpdate = new Date(device.lastUpdate).getTime();
        const status = (Date.now() - lastUpdate) < OFFLINE_THRESHOLD_MS ? 'online' : 'offline';

        return {
            nombre: device.name,
            ip: device.ip,
            status,
            uptime: formatUptime(device.uptime),
            resources: {
                ram: device.totalmem ? Math.round((1 - device.freemem / device.totalmem) * 100) : 0,
                ramUsedMB: bytesToMB(device.totalmem - device.freemem),
                ramTotalMB: bytesToMB(device.totalmem),
                cpu: device.cpu != null ? Math.round(device.cpu * 100) : 0
            },
            disks: (device.disks ?? []).map(mapDisk)
        };
    }

    async function fetchDevices()
    {
        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.getData(`${BACK_PATH_}/devices`);

        if(!serverResponse.success)
        {
            if(serverResponse.status === 401 || serverResponse.status === 403)
            {
                stopPolling();
                let BASE_PATH_ = get(BASE_PATH);
                navigate(`${BASE_PATH_}/`, { replace: true });
                return;
            }

            // Fallas de red reales (PC suspendida, wifi caído, etc.) se reintentan solas en
            // el próximo poll — avisamos una sola vez por corte, no en cada tick de 2s.
            if(!networkErrorShown)
            {
                networkErrorShown = true;
                errorMessage(serverResponse.errorMsg);
            }
            return;
        }

        if(networkErrorShown)
        {
            networkErrorShown = false;
            successMessage('Conexión restablecida.');
        }

        let devices = (await serverResponse.response.json())['response'];
        equipos = devices.map(mapDevice);
    }

    function stopPolling()
    {
        if(timer)
        {
            clearInterval(timer);
            timer = null;
        }
    }

    onMount(async () =>
    {
        currentUser = await withMinDelay(async () =>
        {
            let user = await requireAuth();
            if(user)
            {
                await fetchDevices();
            }
            return user;
        });

        ready = true;
        if(!currentUser) return;

        timer = setInterval(fetchDevices, POLL_INTERVAL_MS);
    });

    onDestroy(() =>
    {
        stopPolling();
    });
</script>

<Title {appName} {comp} />

<Main>
    <div class="flex w-screen h-screen p-8 bg-slate-900 items-center justify-center">
        <div class="flex flex-col p-4 w-full h-full bg-slate-200 rounded-lg shadow-md items-center justify-center gap-4">

            <Nav currentView={'home'} />
            
            {#if !ready}

            <Loading />

            {:else}            

            <!-- Barra de estados -->
            <div class="flex w-full bg-slate-400 rounded-lg justify-around p-2 font-bold items-center">
                <div class="rounded-lg border-x-8 border-blue-600 pt-2 px-8 bg-slate-300">
                    Total Equipos
                    <div class="text-center text-2xl text-blue-400">
                        {equipos.length}
                    </div>
                </div>
                <div class="rounded-lg border-x-8 border-blue-600 pt-2 px-8 bg-slate-300">
                    Equipos Online
                    <div class="text-center text-2xl text-green-400/80">
                        {equiposOnline}
                    </div>
                </div>
                <div class="rounded-lg border-x-8 border-blue-600 pt-2 px-8 bg-slate-300">
                    Equipos Offline
                    <div class="text-center text-2xl text-red-400/80">
                        {equiposOffline}
                    </div>
                </div>
            </div>

            <!-- Display de Equipos -->
            <div class="flex w-full h-full bg-slate-400 rounded-lg items-start py-8 px-4">
                {#each equipos as equipo (equipo.nombre)}

                <Equipo {equipo} />

                {/each}
            </div>

            {/if}

        </div>
    </div>
</Main>
