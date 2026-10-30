# Tests

Pruebas automatizadas del Modelo de pruebas del TP. Los IDs (CP-xx) coinciden con los del documento.

## Cómo correrlos

Desde la raíz del proyecto:

```
npm test
```

Para correr un solo archivo: `node --test tests/users.test.js`.

Requisitos: Node 24 (usa `node:test` y `node:sqlite`, sin dependencias extra) y las dependencias del agente instaladas (`cd client && bun install`) para `agent.test.js`.

## Cómo funcionan

Cada archivo levanta el servidor real (`index.js`) en un puerto libre, apuntando a una **copia temporal** de `api/db/db.db` (variables de entorno `PORT` y `DB_PATH`). La base original nunca se modifica y la copia se borra al terminar. Se usa la cuenta `admin` que viene en la base.

| Archivo | Requerimiento | Casos |
|---|---|---|
| `auth.test.js` | Req 1 — Autenticar usuario | CP-01 a CP-06 |
| `devices.test.js` | Req 2 — Recibir el reporte de estado | CP-07 a CP-11 |
| `agent.test.js` | Req 2 — IP informada por el agente | CP-12 |
| `users.test.js` | Req 4 — Administrar usuarios | CP-15 a CP-22 |
| `permissions.test.js` | Req 5 — Permisos y registro de actividad | CP-23 a CP-26 |

Los casos con sufijo (CP-12b, CP-22b, CP-25b) son controles adicionales que se agregaron al corregir los defectos CP-12 y CP-22.

## Casos manuales (interfaz)

Estos dependen del front (Svelte) y se verifican en el navegador:

- **CP-13** Resumen del dashboard coherente con las tarjetas (total, online y offline).
- **CP-14** Un equipo que deja de reportar más de 5 s pasa a offline, en rojo y con las barras vacías.
- **CP-27** Un usuario sólo con «Ver equipos» no ve la opción «Usuarios» en la barra.
- **CP-28** Ese mismo usuario, al escribir `/users` en la dirección, es redirigido al dashboard.
