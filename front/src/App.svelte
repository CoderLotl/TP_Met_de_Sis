<script>
    import { Router, Route, navigate } from 'svelte-routing';

    import page from './routes/page.svelte';
    import page2 from './routes/page2.svelte';
    import page3 from './routes/page3.svelte';

    const routes =
    [
        { path: '/', component: page },
        { path: '/page2', component: page2 },
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