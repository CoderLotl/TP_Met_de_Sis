# Descripción
---

Esta app consiste en una app-cliente sin interface, la cual corre como un proceso constante.
Su función actual es es generar un heartbeat constante, con un beat por segundo.
La app funciona con un archivo config.json que debe ser copiado en la misma carpeta que el .exe resultante de la compilación para funcionar correctamente.

`config.json` admite:
- **`serverUrl`** (obligatorio): URL del servidor, por ejemplo `http://192.168.0.5:3000`.
- **`ip`** (opcional): IP que se informa al servidor. Si se omite, se detecta la IP de la placa que el sistema usa para llegar al servidor (evita informar la de adaptadores virtuales como VirtualBox o una VPN).

# Instrucciones
---

0- Correr **`install_bun.ps1`**. ***(solo si Bun no fue instalado antes)***
1- Ejecutar **`bun install`**.
2- Ejecutar **`bun build ./index.ts --compile --outfile ./bin/client.exe --windows-hide-console`** para compilar el cliente.