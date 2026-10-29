<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { BACK_PATH, APP_NAME } from '../lib/stores/stores.js';

    import { requirePermission, withMinDelay } from '../lib/auth.js';
    import { PERMISSIONS } from '../lib/constants/Permissions.js';
    import { DataAccessFetch } from '../lib/services/DataAccessFetch.js';
    import { successMessage, errorMessage } from '../lib/services/ToastDialoguer.js';

    import Title from '../components/snippets/Page_Title.svelte';
    import Main from '../components/Main.svelte';
    import Nav from '../components/Nav.svelte';
    import Loading from '../components/snippets/Loading.svelte';

    const dataAccess = new DataAccessFetch();

    // Catálogo de permisos a mostrar uno por uno en el form de edición.
    const PERMISSION_DEFS = [
        { bit: PERMISSIONS.MANAGE_USERS, label: 'Gestionar usuarios' },
        { bit: PERMISSIONS.VIEW_DEVICES, label: 'Ver equipos' }
    ];

    $: appName = $APP_NAME;
    let comp = 'Usuarios';

    let currentUser = null;
    let ready = false;
    let users = [];

    // null = ninguno abierto, 'new' = form de alta, <id> = editando esa fila
    let editingId = null;

    function emptyPermissions()
    {
        return Object.fromEntries(PERMISSION_DEFS.map(p => [p.bit, false]));
    }

    let form = { user: '', mail: '', password: '', status: 'active', deletedFlag: false, permissions: emptyPermissions() };

    function permissionsFromKey(permissionKey)
    {
        return Object.fromEntries(PERMISSION_DEFS.map(p => [p.bit, (permissionKey & p.bit) === p.bit]));
    }

    function permissionsToKey(permissions)
    {
        return PERMISSION_DEFS.reduce((key, p) => key | (permissions[p.bit] ? p.bit : 0), 0);
    }

    function resetForm()
    {
        form = { user: '', mail: '', password: '', status: 'active', deletedFlag: false, permissions: emptyPermissions() };
    }

    function openCreate()
    {
        resetForm();
        editingId = 'new';
    }

    function openEdit(user)
    {
        form = {
            user: user.user,
            mail: user.mail,
            password: '',
            status: user.status,
            deletedFlag: !!user.deleted,
            permissions: permissionsFromKey(user.permissionKey)
        };
        editingId = user.id;
    }

    function closeForm()
    {
        editingId = null;
        resetForm();
    }

    async function fetchUsers()
    {
        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.getData(`${BACK_PATH_}/user`);

        if(!serverResponse.success)
        {
            errorMessage(serverResponse.errorMsg);
            return;
        }

        users = (await serverResponse.response.json())['response'];
    }

    async function createUser()
    {
        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.postData(`${BACK_PATH_}/user/register`, {
            user: form.user,
            mail: form.mail,
            password: form.password
        });

        if(!serverResponse.success)
        {
            errorMessage(serverResponse.errorMsg);
            return;
        }

        successMessage('Usuario creado.');
        closeForm();
        await fetchUsers();
    }

    async function saveUser(id)
    {
        let payload = {
            user: form.user,
            mail: form.mail,
            status: form.status,
            deleted: form.deletedFlag ? 1 : 0,
            permissionKey: permissionsToKey(form.permissions)
        };

        if(form.password)
        {
            payload.password = form.password;
        }

        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.patchData(`${BACK_PATH_}/user/${id}`, payload);

        if(!serverResponse.success)
        {
            errorMessage(serverResponse.errorMsg);
            return;
        }

        successMessage('Usuario actualizado.');
        closeForm();
        await fetchUsers();
    }

    async function deleteUser(user)
    {
        if(!confirm(`¿Dar de baja a "${user.user}"?`)) return;

        let BACK_PATH_ = get(BACK_PATH);
        let serverResponse = await dataAccess.deleteData(`${BACK_PATH_}/user/${user.id}`);

        if(!serverResponse.success)
        {
            errorMessage(serverResponse.errorMsg);
            return;
        }

        successMessage('Usuario dado de baja.');
        await fetchUsers();
    }

    onMount(async () =>
    {
        currentUser = await withMinDelay(async () =>
        {
            let user = await requirePermission(PERMISSIONS.MANAGE_USERS);
            if(user)
            {
                await fetchUsers();
            }
            return user;
        });

        ready = true;
    });
</script>

<Title {appName} {comp} />

<Main>
    <div class="flex w-screen h-screen p-8 bg-slate-900 items-center justify-center">
        <div class="flex flex-col p-4 w-full h-full bg-slate-200 rounded-lg shadow-md gap-4 {ready ? 'overflow-y-auto' : 'items-center justify-center'}">

            <Nav currentView={'users'} />
            
            {#if !ready}

            <Loading />

            {:else}            

            <div class="flex justify-between items-center px-2">
                <h1 class="text-2xl font-bold">Usuarios</h1>
                <button on:click={openCreate} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Crear usuario
                </button>
            </div>

            {#if editingId === 'new'}
            <div class="flex flex-col gap-2 p-4 bg-slate-100 rounded-lg mx-2">
                <h2 class="font-bold">Nuevo usuario</h2>
                <div class="flex gap-2 flex-wrap">
                    <input type="text" placeholder="Usuario" bind:value={form.user} class="px-3 py-2 rounded-md border border-gray-300" />
                    <input type="email" placeholder="Mail" bind:value={form.mail} class="px-3 py-2 rounded-md border border-gray-300" />
                    <input type="password" placeholder="Contraseña" bind:value={form.password} class="px-3 py-2 rounded-md border border-gray-300" />
                </div>
                <div class="flex gap-2 mt-2">
                    <button on:click={createUser} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Crear</button>
                    <button on:click={closeForm} class="px-4 py-2 bg-slate-300 rounded-md hover:bg-slate-400">Cancelar</button>
                </div>
            </div>
            {/if}

            <div class="mx-2 overflow-x-auto">
                <table class="w-full text-left bg-slate-100 rounded-lg overflow-hidden">
                    <thead class="bg-slate-300">
                        <tr>
                            <th class="p-2">Usuario</th>
                            <th class="p-2">Mail</th>
                            <th class="p-2">Estado</th>
                            <th class="p-2">Permisos</th>
                            <th class="p-2">Registrado</th>
                            <th class="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each users as user (user.id)}
                        <tr class="border-t border-gray-300 {user.deleted ? 'opacity-50' : ''}">
                            <td class="p-2">{user.user}</td>
                            <td class="p-2">{user.mail}</td>
                            <td class="p-2">
                                {#if user.deleted}
                                    <span class="px-2 py-1 rounded-full bg-gray-400 text-white text-xs">Baja</span>
                                {:else if user.status === 'banned'}
                                    <span class="px-2 py-1 rounded-full bg-red-500 text-white text-xs">Baneado</span>
                                {:else}
                                    <span class="px-2 py-1 rounded-full bg-green-600 text-white text-xs">Activo</span>
                                {/if}
                            </td>
                            <td class="p-2 text-sm">
                                {PERMISSION_DEFS.filter(p => (user.permissionKey & p.bit) === p.bit).map(p => p.label).join(', ') || 'Sin permisos'}
                            </td>
                            <td class="p-2 text-sm">{new Date(user.registered).toLocaleString()}</td>
                            <td class="p-2">
                                <div class="flex gap-2">
                                    <button on:click={() => openEdit(user)} class="px-3 py-1 bg-slate-300 rounded-md hover:bg-slate-400">
                                        Editar
                                    </button>
                                    {#if !user.deleted}
                                    <button on:click={() => deleteUser(user)} disabled={user.id === currentUser?.userId}
                                        class="px-3 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed">
                                        Dar de baja
                                    </button>
                                    {/if}
                                </div>

                                {#if editingId === user.id}
                                <div class="flex flex-col gap-3 p-4 bg-slate-200 rounded-lg mt-2 w-max">
                                    <div class="flex gap-2 flex-wrap">
                                        <input type="text" placeholder="Usuario" bind:value={form.user} class="px-3 py-2 rounded-md border border-gray-300" />
                                        <input type="email" placeholder="Mail" bind:value={form.mail} class="px-3 py-2 rounded-md border border-gray-300" />
                                        <input type="password" placeholder="Nueva contraseña (opcional)" bind:value={form.password} class="px-3 py-2 rounded-md border border-gray-300" />
                                    </div>

                                    <div class="flex flex-col gap-1 bg-slate-100 p-3 rounded-md">
                                        <span class="font-semibold text-sm border-b border-gray-300 pb-1">Cuenta</span>
                                        <label class="flex items-center justify-between gap-4 text-sm py-1">
                                            <span>Estado</span>
                                            <select bind:value={form.status} class="px-2 py-1 rounded-md border border-gray-300">
                                                <option value="active">Activo</option>
                                                <option value="banned">Baneado</option>
                                            </select>
                                        </label>
                                        <label class="flex items-center justify-between gap-4 text-sm py-1 {user.id === currentUser?.userId ? 'opacity-40' : ''}">
                                            <span>Usuario dado de baja</span>
                                            <select bind:value={form.deletedFlag} disabled={user.id === currentUser?.userId} class="px-2 py-1 rounded-md border border-gray-300">
                                                <option value={false}>No</option>
                                                <option value={true}>Sí</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div class="flex flex-col gap-1 bg-slate-100 p-3 rounded-md">
                                        <span class="font-semibold text-sm border-b border-gray-300 pb-1">Permisos</span>
                                        {#each PERMISSION_DEFS as perm}
                                        <label class="flex items-center justify-between gap-4 text-sm py-1 {user.id === currentUser?.userId ? 'opacity-40' : ''}">
                                            <span>{perm.label}</span>
                                            <select bind:value={form.permissions[perm.bit]} disabled={user.id === currentUser?.userId} class="px-2 py-1 rounded-md border border-gray-300">
                                                <option value={false}>No</option>
                                                <option value={true}>Sí</option>
                                            </select>
                                        </label>
                                        {/each}
                                    </div>

                                    <div class="flex gap-2 mt-1">
                                        <button on:click={() => saveUser(user.id)} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Guardar</button>
                                        <button on:click={closeForm} class="px-4 py-2 bg-slate-300 rounded-md hover:bg-slate-400">Cancelar</button>
                                    </div>
                                </div>
                                {/if}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {/if}

        </div>
    </div>
</Main>
