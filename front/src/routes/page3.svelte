<script>
    import { navigate } from 'svelte-routing';
    import Main from '../components/Main.svelte';

    function nav(path)
    {
        navigate(path);
    }
</script>

<Main>
    <div class="grow h-full w-full bg-green-500 px-2 py-2">
    <button
    class="bg-slate-200 hover:bg-red-500/50 px-3 py-2 rounded-md duration-300 mr-4"
    on:click={nav('/')}>
        A la página 1
    </button>

    <button
    class="bg-slate-200 hover:bg-red-500/50 px-3 py-2 rounded-md duration-300"
    on:click={nav('/page2')}>
        A la página 2
    </button>
    </div>
</Main>