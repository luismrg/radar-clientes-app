# Radar Clientes

Aplicacion de prospeccion comercial que consulta negocios directamente en Google Maps Places. Las fichas, telefonos, valoraciones y sitios web proceden de la respuesta de Google; no se sustituyen por datos de ejemplo cuando falla una busqueda.

## Requisitos

- Node.js 20.19 o posterior
- Un proyecto de Google Cloud con **Places API (New)** habilitada y facturacion activa
- Una clave de Google Maps Platform restringida a Places API (New)

## Ejecucion local

1. Instala las dependencias:

   ```powershell
   npm install
   ```

2. Copia `.env.example` como `.env.local` y configura la clave de Maps:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```env
   GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
   ```

   La clave se usa unicamente en el servidor. No la configures como variable `VITE_*` ni la compartas en el navegador.

3. Inicia la aplicacion:

   ```powershell
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

`GEMINI_API_KEY` es opcional y solo se usa para redactar propuestas B2B. Sin esa clave, la aplicacion genera una propuesta basica. En despliegues, configura `GOOGLE_MAPS_API_KEY` como variable de entorno del servidor.

## Busquedas y enlaces

- Las busquedas usan la API de texto de Places y su paginacion real (hasta 60 resultados).
- El enlace de sitio web solo aparece cuando Google Maps devuelve `websiteUri` en la ficha del negocio.
- Si Maps no publica un sitio web, la aplicacion lo indica en lugar de inventar un dominio.
- Si la clave, la API o la facturacion no estan configuradas, se muestra el error devuelto por Google con pasos para corregirlo.
