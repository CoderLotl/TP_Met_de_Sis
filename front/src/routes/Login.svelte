<script>
    import { navigate } from 'svelte-routing';
    import { BACK_PATH, APP_NAME } from '../lib/stores/stores.js';

    import { errorMessage } from '../lib/services/ToastDialoguer.js';

    import Title from '../components/Page_Title.svelte';
    import Main from '../components/Main.svelte';

    import loading_spinner from '../assets/loading.gif';

    $: appName = $APP_NAME;
    let comp = 'Login';
    let loginTimeOut = null;
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

    function login(e)
    {
        e?.preventDefault();
        loginTimeOut = null;
        logging = true;

        loginTimeOut = setTimeout(() =>
        {
            logging = false;
            loginTimeOut = null;

            if(user != 'admin' && password != 'admin')
            {                
                errorMessage('Usuario o contraseña incorrectos.');
                user = '';
                password = '';
                return;
            }
            nav('/home');
        }, 2000);        
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