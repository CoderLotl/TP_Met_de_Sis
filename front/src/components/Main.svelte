<script>
    import { Toaster } from 'svelte-5-french-toast';
</script>

<div class="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100">
    <slot/>
    <Toaster />
</div>