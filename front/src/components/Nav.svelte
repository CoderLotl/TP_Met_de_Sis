<script>
    import { navigate } from 'svelte-routing';
    import { get } from 'svelte/store';
    import { BACK_PATH, CURRENT_USER } from '../lib/stores/stores.js';
    import { hasPermission } from '../lib/auth.js';
    import { PERMISSIONS } from '../lib/constants/Permissions.js';
    import { DataAccessFetch } from '../lib/services/DataAccessFetch.js';

    export let currentView = '';

    const styles = ['hover:text-slate-200 bg-slate-400/50 hover:bg-red-500/80', 'text-slate-200 bg-red-500/80'];
    const dataAccess = new DataAccessFetch();

    async function logout()
    {
        let BACK_PATH_ = get(BACK_PATH);
        await dataAccess.postData(`${BACK_PATH_}/user/logout`);
        CURRENT_USER.set(null);
        navigate('/');
    }
</script>

<div class="flex w-full bg-slate-300 rounded-lg justify-between p-2 font-bold items-center mb-2">
    <div class="flex gap-4 items-center px-2">
        <button on:click={() => navigate('/home')}
            class="{currentView == 'home' ? styles[1] : styles[0]} hover:cursor-pointer duration-300 rounded-md p-2">
            Dashboard
        </button>
        {#if hasPermission($CURRENT_USER, PERMISSIONS.MANAGE_USERS)}
        <button on:click={() => navigate('/users')}
            class="{currentView == 'home' ? styles[0] : styles[1]} hover:cursor-pointer duration-300 rounded-md p-2">
            Usuarios
        </button>
        {/if}
    </div>
    <div class="flex items-center gap-4 px-2">
        <span class="text-sm font-normal text-gray-600">{$CURRENT_USER?.user}</span>
        <button on:click={logout} class="px-4 py-2 bg-slate-200 hover:bg-red-500/50 rounded-md duration-300">
            Cerrar sesión
        </button>
    </div>
</div>
