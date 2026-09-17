<script>
    import { onMount, onDestroy } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { BACK_PATH, APP_NAME } from '../lib/stores/stores.js';

    import Title from '../components/snippets/Page_Title.svelte';
    import Main from '../components/Main.svelte';
    import Equipo from '../components/snippets/Equipo.svelte';

    $: appName = $APP_NAME;
    let comp = 'Main Board';

    $: equiposOnline = equipos.filter(equipo => equipo.status === 'online').length;
    $: equiposOffline = equipos.filter(equipo => equipo.status === 'offline').length;

    let timer = null;

    let equipos =
    [
        { id: 1, nombre: 'Equipo A', status: 'online', ip: '192.168.1.101', uptime: { hours: 1, mins: 13, seconds: 22}, resources: { ram: 10, cpu: 20}},
        { id: 2, nombre: 'Equipo B', status: 'online', ip: '192.168.1.102', uptime: { hours: 0, mins: 0, seconds: 0}, resources: { ram: 20, cpu: 20} },
        { id: 3, nombre: 'Equipo C', status: 'offline', ip: '192.168.1.103', uptime: { hours: 0, mins: 0, seconds: 0}, resources: { ram: 20, cpu: 20} },
    ];

    function nav(path)
    {
        navigate(path);
    }

    onMount(() => {
        timer = setInterval(() => {
            equipos.forEach(equipo => {
                if (equipo.status !== 'online') return;

                // Tiempo
                equipo.uptime.seconds++;

                if(equipo.uptime.seconds >= 60)
                {
                    equipo.uptime.seconds = 0;
                    equipo.uptime.mins++;
                }

                if(equipo.uptime.mins >= 60)
                {
                    equipo.uptime.mins = 0;
                    equipo.uptime.hours++;
                }

                // Recursos
                let min = 5;
                let max = 100;

                let minCeiled = Math.ceil(-5);
                let maxFloored = Math.floor(5);

                let change = ()=>Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);

                equipo.resources.ram = (()=>
                {
                    const c = change();
                    return (equipo.resources.ram + c >= min && equipo.resources.ram + c <= max) ? equipo.resources.ram + c : equipo.resources.ram;
                })();

                equipo.resources.cpu = (()=>
                {
                    const c = change();
                    return (equipo.resources.cpu + c >= min && equipo.resources.cpu + c <= max) ? equipo.resources.cpu + c : equipo.resources.cpu;
                })();                
            });

            // Reasignación para forzar a Svelte a actualizar la vista
            equipos = equipos;
        }, 1000);
    });

    onDestroy(() =>
    {
        clearInterval(timer);
    });
</script>

<Title {appName} {comp} />

<Main>
    <div class="flex w-screen h-screen p-8 bg-slate-900 items-center justify-center">
        <div class="flex flex-col p-4 w-full h-full bg-slate-200 rounded-lg shadow-md items-center justify-center gap-4">

            <!-- Barra de estados -->
            <div class="flex w-full bg-slate-400 rounded-lg justify-around p-2 font-bold">
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
                {#each equipos as equipo}

                <Equipo {equipo} />

                {/each}
            </div>

        </div>
    </div>
</Main>