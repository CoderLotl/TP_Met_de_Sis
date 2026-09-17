<script>
    import { Router, Route, navigate } from 'svelte-routing';
    import { BACK_PATH, BASE_PATH, APP_NAME } from './lib/stores/stores.js';
    import { writable, get } from 'svelte/store';
    import { GetAppName } from './lib/app.js';

    import Login from './routes/Login.svelte';
    import Home from './routes/Home.svelte';
    import page3 from './routes/page3.svelte';

    const isDev = import.meta.env.MODE;

    if(isDev == 'development')
    {
      BASE_PATH.set('');
      BACK_PATH.set('http://localhost'); // << - - - setear la URL de DEV acá      
    }
    else
    {
      BASE_PATH.set('');
      BACK_PATH.set(window.location.origin); // << - - - setear la URL de PROD acá      
    }

    GetAppName();

    const routes =
    [
        { path: '/', component: Login },
        { path: '/home', component: Home },
        { path: '/page3', component: page3 }
    ];
</script>

<Router>
    {#each routes as { path, component }}
        <Route {path} let:params>
            <svelte:component this={component} {...params} />
        </Route>
    {/each}
</Router>