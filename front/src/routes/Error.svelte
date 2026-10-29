<script>
    import { navigate } from 'svelte-routing';
    import { BASE_PATH, APP_NAME, ERROR_INFO } from '../lib/stores/stores.js';

    import Title from '../components/snippets/Page_Title.svelte';
    import Main from '../components/Main.svelte';

    $: appName = $APP_NAME;
    let comp = 'Error';

    const flash = $ERROR_INFO;
    ERROR_INFO.set(null);

    const title = flash?.title ?? 'Página no encontrada';
    const message = flash?.message ?? 'La página que buscás no existe o fue movida.';

    function goHome()
    {
        navigate(`${$BASE_PATH}/`, { replace: true });
    }
</script>

<Title {appName} {comp} />

<Main>
    <div class="flex grow h-full w-full bg-slate-900 px-2 py-2 items-center justify-center">

        <div class="flex flex-col items-center justify-center py-6 px-8 gap-2 rounded-lg bg-slate-200 text-slate-800">
            <h1 class="text-3xl font-bold">{title}</h1>
            <p class="text-center">{message}</p>
            <button on:click={goHome} class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Volver al inicio
            </button>
        </div>

    </div>
</Main>
