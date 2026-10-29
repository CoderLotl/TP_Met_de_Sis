import { writable } from 'svelte/store';

export let BASE_PATH = writable('');
export let BACK_PATH = writable('');
export let APP_NAME = writable('');

/*
Cachea el último usuario/permisos conocidos entre navegaciones (el módulo persiste
mientras dure la SPA, a diferencia de las variables locales de cada página que se
reinician en cada mount). Nav la usa para decidir qué mostrar al instante, sin esperar
el chequeo en vivo de requireAuth()/requirePermission() de la página recién montada.
El chequeo en vivo sigue siendo la fuente de verdad: solo confirma o corrige este valor,
y el backend vuelve a validar todo igual en cada request real.
*/
export let CURRENT_USER = writable(null);

/*
"Flash" store for the Error page. Whatever sends the user to /error can set
{ title, message } here right before navigating; Error.svelte reads it once and
resets it to null, so a stale message never leaks into a later, unrelated visit.
If nothing was set (e.g. the client-side catch-all route matched), Error.svelte
falls back to a generic "page not found" message.
*/
export let ERROR_INFO = writable(null);