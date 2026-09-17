<script>
    export let maxValue = 100;
    export let segments = [];
    export let healthyColorClass = 'bg-slate-900';
    export let online = true;

    $: totalSegmentValue = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    $: healthyValue = Math.max(0, maxValue - totalSegmentValue);

    function pct(value)
    {
        return maxValue > 0 ? Math.max(0, Math.min(100, (value / maxValue) * 100)) : 0;
    }
</script>

<div class="w-full h-[20px] flex overflow-hidden rounded-lg relative">
    {#each segments as seg}
        <div class="{seg.colorClass} h-full transition-all duration-200 items-end justify-center flex" style="width: {pct(Math.max(0, seg.value))}%">            
        </div>
        {#if online}
            <div class="absolute left-1/2 text-slate-200 font-semibold">
                {seg.value > 0 ? seg.value : ''}%
            </div>
        {/if}
    {/each}
    <div class="{healthyColorClass} h-full transition-all duration-200 items-center justify-center flex" style="width: {pct(healthyValue)}%">        
    </div>
</div>
