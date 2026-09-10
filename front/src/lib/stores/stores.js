import { writable } from 'svelte/store';

export let BASE_PATH = writable('');
export let BACK_PATH = writable('');
export let APP_NAME = writable('');

/*
"Flash" store for the Error page. Whatever sends the user to /error can set
{ title, message } here right before navigating; Error.svelte reads it once and
resets it to null, so a stale message never leaks into a later, unrelated visit.
If nothing was set (e.g. the client-side catch-all route matched), Error.svelte
falls back to a generic "page not found" message.
*/
export let ERROR_INFO = writable(null);