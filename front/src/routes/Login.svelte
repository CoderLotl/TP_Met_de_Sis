<script>
    import { navigate } from 'svelte-routing';
    import { get } from 'svelte/store';
    import { BACK_PATH, APP_NAME } from '../lib/stores/stores.js';

    import { errorMessage } from '../lib/services/ToastDialoguer.js';
    import { DataAccessFetch } from '../lib/services/DataAccessFetch.js';

    import Title from '../components/snippets/Page_Title.svelte';
    import Main from '../components/Main.svelte';

    import loading_spinner from '../assets/loading.gif';

    const dataAccess = new DataAccessFetch();

    $: appName = $APP_NAME;
    let comp = 'Login';
    let logging = false;
    $: spinnerVisible = logging ? '' : 'invisible';

    let user = '';
    let password = '';

    function nav(path)
    {
        navigate(path);
    }

    function handleKeydown(e)
    {
        if(e.key === 'Enter')
        {
            login(e);
        }
    }

    async function login(e)
    {
        e?.preventDefault();
        logging = true;

        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.postData(`${BACK_PATH_}/user/login`, { user, password }, true, false, 'Error al iniciar sesión:');

        logging = false;

        if(!serverResponse.success)
        {
            errorMessage(serverResponse.errorMsg);
            user = '';
            password = '';
            return;
        }

        nav('/home');
    }
</script>

<Title {appName} {comp} />

<Main>
    <div class="flex grow h-full w-full bg-slate-900 px-2 py-2 items-center justify-center">

        <div class="flex flex-col items-center justify-center py-3 px-8 gap-2 rounded-lg bg-slate-200 text-slate-800">
            <div class="flex flex-col items-center justify-center gap-2">
                <h1 class="text-3xl font-bold">Login</h1>
                <p class="">Ingrese sus credenciales para acceder a la aplicación.</p>
            </div>
            <div class="flex flex-col items-center justify-center gap-2">
                <input type="text" placeholder="Usuario" bind:value={user} on:keydown={handleKeydown}
                class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                <input type="password" placeholder="Contraseña" bind:value={password} on:keydown={handleKeydown}
                class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <button on:click={() => login()} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Ingresar</button>
            </div>
            <span class="{spinnerVisible}">
                <img src={loading_spinner} alt="Cargando..." class="w-16 h-16" />
            </span>
        </div>

    </div>
</Main>