<script>
    export let equipo;
    import pc from '../../assets/computer.png';
    import clock from '../../assets/clock.png';

    import Progress_Bar from './Progress_Bar_Stacked.svelte';
</script>

<!-- Equipo -->
<div class="flex flex-col w-[300px] pb-6 m-2 bg-slate-200 rounded-lg shadow-md overflow-hidden">
    <!-- Barra decoradora TOP -->
    <div class="w-full h-[15px] bg-green-400 mb-4"></div>

    <div class="px-4 w-full h-full">
        <!-- TOP -->
        <div class="flex justify-around">
            <h3 class="text-lg font-bold">
                {equipo.nombre}
            </h3>
            <div class="flex py-1 pl-4 pr-2 rounded-full {equipo.status === 'online' ? 'bg-green-700/70' : 'bg-red-500/30'} items-center gap-1">
                <span class="block -mt-[4px] {equipo.status !== 'online' ? 'italic' : ''}">
                    {equipo.status}
                </span>
                <!-- 🔴 🟢 -->
                <span class="relative flex size-3">
                    <span class="absolute inline-flex h-full w-full rounded-full opacity-75 {equipo.status === 'online' ? 'bg-green-900 animate-ping' : ''}"></span>
                    <span class="relative inline-flex size-3 rounded-full {equipo.status === 'online' ? 'bg-green-900' : 'bg-red-500'}"></span>
                </span>
            </div>
        </div>

        <!-- separador -->
        <div class="w-full h-[1px] bg-gray-700/70 mt-4"></div>

        <!-- 1er body -->
        <div class="mt-4 px-4">
            <!-- 1er row -->
            <div class="flex justify-between">
                <div class="flex w-[90px] items-end">
                    <img src={pc} alt="computer" class="inline mr-4 w-[20px]">
                    <span>
                        IP:
                    </span>
                </div>
                <div class="text-gray-600 flex items-end font-semibold">
                    {equipo.ip}
                </div>                                    
            </div>
            <!-- 2do row -->
            <div class="flex justify-between mt-2">
                <div class="flex w-[90px] items-end">
                    <img src={clock} alt="computer" class="inline mr-4 w-[20px]">
                    <span>
                        Uptime:
                    </span>
                </div>
                <div class="text-gray-600 flex items-end font-semibold">
                    {equipo.uptime.hours < 10 ? '0' : ''}{equipo.uptime.hours}:{equipo.uptime.mins < 10 ? '0' : ''}{equipo.uptime.mins}:{equipo.uptime.seconds < 10 ? '0' : ''}{equipo.uptime.seconds}
                </div>                                    
            </div>
        </div>

        <!-- separador -->
        <div class="w-full h-[1px] bg-gray-700/70 mt-4"></div>

        <!-- 2do body -->
        <div class="mt-4 px-4">
            <p>Uso de recursos</p>
            <div class="mt-2 flex items-center justify-between">
                <div class="mb-[3px]">
                    RAM:
                </div>
                <div class="w-[160px]">
                    <Progress_Bar maxValue=100
                        segments={[
                        { value: equipo.status === 'online' ? equipo.resources.ram : 0, colorClass: 'bg-green-600' }
                        ]}
                        online={equipo.status === 'online'}
                    />
                </div>
            </div>
            <div class="mt-2 flex items-center justify-between">
                <div class="mb-[3px]">
                    CPU:
                </div>
                <div class="w-[160px]">
                    <Progress_Bar maxValue=100
                        segments={[
                        { value: equipo.status === 'online' ? equipo.resources.cpu : 0, colorClass: 'bg-green-600' }
                        ]}
                        online={equipo.status === 'online'}
                    />
                </div>
            </div>
        </div>
    </div>
</div>