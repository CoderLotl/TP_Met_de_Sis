import { get } from 'svelte/store';
import { navigate } from 'svelte-routing';
import { DataAccessFetch } from './services/DataAccessFetch.js';
import { BACK_PATH, BASE_PATH, CURRENT_USER } from './stores/stores.js';

const dataAccess = new DataAccessFetch();

export function hasPermission(currentUser, bit)
{
    return !!currentUser && (currentUser.permissionKey & bit) === bit;
}

// Devuelve { userId, user, permissionKey } si hay sesión, o false y redirige a '/' si no.
// De paso actualiza el store CURRENT_USER (ver stores.js) con el resultado confirmado.
export async function requireAuth()
{
    let BACK_PATH_ = get(BACK_PATH);
    let serverResponse = await dataAccess.getData(`${BACK_PATH_}/user/me`);

    if(!serverResponse.success)
    {
        CURRENT_USER.set(null);
        let BASE_PATH_ = get(BASE_PATH);
        navigate(`${BASE_PATH_}/`, { replace: true });
        return false;
    }

    let currentUser = (await serverResponse.response.json())['response'];
    CURRENT_USER.set(currentUser);
    return currentUser;
}

// Como requireAuth(), pero además exige un permiso puntual; si falta, manda a /home.
export async function requirePermission(bit)
{
    let currentUser = await requireAuth();
    if(!currentUser) return false;

    if(!hasPermission(currentUser, bit))
    {
        let BASE_PATH_ = get(BASE_PATH);
        navigate(`${BASE_PATH_}/home`, { replace: true });
        return false;
    }

    return currentUser;
}

// Espera a que resuelva asyncFn(), pero nunca devuelve antes de minMs —
// evita el flash de "página vacía -> aparece todo de golpe" en los checks de sesión/permisos.
export async function withMinDelay(asyncFn, minMs = 1000)
{
    const start = Date.now();
    const result = await asyncFn();
    const elapsed = Date.now() - start;

    if(elapsed < minMs)
    {
        await new Promise(resolve => setTimeout(resolve, minMs - elapsed));
    }

    return result;
}
