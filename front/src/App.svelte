<script>
    import { Router, Route } from 'svelte-routing';
    import { BACK_PATH, BASE_PATH } from './lib/stores/stores.js';
    import { GetAppName } from './lib/app.js';

    import Login from './routes/Login.svelte';
    import Home from './routes/Home.svelte';
    import Users from './routes/Users.svelte';
    import Error from './routes/Error.svelte';

    // En dev, el servidor de Vite proxea /user, /devices, /app_name y /test hacia
    // el back (ver vite.config.js), así que una ruta relativa alcanza en ambos casos.
    BASE_PATH.set('');
    BACK_PATH.set('');

    GetAppName();

    const routes =
    [
        { path: '/', component: Login },
        { path: '/home', component: Home },
        { path: '/users', component: Users },
        { path: '/error', component: Error },
        { path: '*', component: Error }
    ];
</script>

<Router>
    {#each routes as { path, component }}
        <Route {path} let:params>
            <svelte:component this={component} {...params} />
        </Route>
    {/each}
</Router>