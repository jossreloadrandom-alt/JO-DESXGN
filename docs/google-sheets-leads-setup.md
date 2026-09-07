# Cómo conectar `campaign.html` a Google Sheets (Fase F7.7)

Esta guía no requiere saber programar. Sigue los pasos en orden, en este
mismo orden, sin saltarte ninguno. Al final vas a tener una URL que pegas
en un solo lugar de `campaign.html` y el formulario quedará funcionando.

GoHighLevel **no se usa en ningún punto de este flujo** — esta es una
alternativa gratuita, propia, sin suscripción mensual.

---

## 1. Crear la Google Sheet

1. Entra a [sheets.google.com](https://sheets.google.com) con la cuenta de
   Google que quieras usar para administrar los leads de la campaña.
2. Crea una hoja de cálculo en blanco.
3. Ponle un nombre reconocible, por ejemplo: `Leads — Campaña JOSS DESXGN`.
4. En la **primera fila** (fila 1), escribe estos 11 encabezados, una por
   columna, exactamente en este orden (de A a K):

   | A | B | C | D | E | F | G | H | I | J | K |
   |---|---|---|---|---|---|---|---|---|---|---|
   | Timestamp | Nombre | WhatsApp | Email | Presupuesto | Contexto | Origen | UTM Source | UTM Medium | UTM Campaign | UTM Content |

   No agregues columnas extra — el script que vas a instalar en el paso
   siguiente escribe exactamente en este orden, y una columna de más o de
   menos desalinearía todos los datos.

---

## 2. Crear el Apps Script dentro de esa misma hoja

1. Con la hoja abierta, ve al menú **Extensiones → Apps Script**.
   Esto abre un editor de código en una pestaña nueva, ya conectado a tu
   hoja (no necesitas configurar nada de conexión — Apps Script vive
   "dentro" de la hoja que lo abrió).
2. Vas a ver un archivo llamado `Código.gs` (o `Code.gs`) con contenido de
   ejemplo tipo `function myFunction() { }`. **Borra todo ese contenido.**
3. Abre el archivo [`docs/apps-script/Code.gs`](apps-script/Code.gs) de
   este mismo proyecto, copia **todo** su contenido, y pégalo en el editor
   de Apps Script (reemplazando lo que borraste en el paso anterior).
4. Guarda con el ícono de disquete (o `Ctrl+S` / `Cmd+S`). Cuando te pida
   un nombre para el proyecto, ponle algo como `Leads Campaña JOSS DESXGN`.

No necesitas entender el código para que funcione — está comentado en
español explicando cada parte, por si en algún momento quieres revisarlo.

---

## 3. Publicar el Apps Script como "Web App"

Este es el paso que genera la URL que necesita `campaign.html`.

1. En el editor de Apps Script, arriba a la derecha, haz clic en
   **Implementar → Nueva implementación** ("Deploy → New deployment").
2. Junto a "Selecciona el tipo", haz clic en el ícono de engranaje ⚙️ y
   elige **Aplicación web** ("Web app").
3. Completa así:
   - **Descripción**: `Leads campaign.html` (o lo que prefieras).
   - **Ejecutar como**: `Yo` (tu propia cuenta — así el script tiene
     permiso de escribir en tu hoja).
   - **Quién tiene acceso**: `Cualquier usuario` ("Anyone"). Esto es
     necesario para que el formulario público de la landing pueda enviar
     datos sin que el visitante necesite iniciar sesión en Google. No
     expone tu hoja de cálculo — solo permite que ese script reciba
     solicitudes POST.
4. Haz clic en **Implementar** ("Deploy").
5. Google puede pedirte autorizar permisos la primera vez (una pantalla de
   "esta app no está verificada" es normal para un script personal — haz
   clic en "Avanzado" → "Ir a [nombre del proyecto] (no seguro)" y luego
   "Permitir"). Esto es porque es tu propio script, no de un tercero.
6. Al terminar, Google te muestra una **URL de la aplicación web**, algo
   así como:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

   **Copia esa URL completa.** Es la única pieza de información que falta
   para que el formulario funcione.

> **Nota**: si más adelante editas el código del Apps Script, tienes que
> volver a "Implementar → Administrar implementaciones → editar (ícono de
> lápiz) → Nueva versión → Implementar" para que los cambios se apliquen a
> esa misma URL. Guardar el archivo por sí solo no actualiza la URL
> publicada.

---

## 4. Pegar la URL en `campaign.html`

1. Abre `campaign.html` en un editor de texto.
2. Busca esta línea (cerca del inicio del bloque `<script>`):

   ```javascript
   var GOOGLE_SHEETS_WEBHOOK_URL = "{{GOOGLE_SHEETS_WEBHOOK_URL}}";
   ```

3. Reemplaza **únicamente** el texto `{{GOOGLE_SHEETS_WEBHOOK_URL}}` (sin
   tocar las comillas) por la URL que copiaste en el paso 3.6. Debe quedar
   así, con tu URL real:

   ```javascript
   var GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```

4. Guarda el archivo.

---

## 5. Probar que funciona

1. Abre `campaign.html` en un navegador (puedes abrirlo directo desde el
   explorador de archivos, o servirlo con cualquier servidor local).
2. Completa el formulario con datos de prueba **claramente identificables**
   como prueba, por ejemplo:
   - Nombre: `PRUEBA — borrar`
   - WhatsApp: tu propio número
   - Presupuesto: cualquiera de las opciones
3. Envía el formulario **una sola vez**.
4. Vuelve a tu Google Sheet — debería aparecer una fila nueva con esos
   datos, con la columna "Timestamp" llena automáticamente.
5. Si aparece la fila: funciona correctamente. Borra esa fila de prueba
   (clic derecho sobre el número de fila → "Eliminar fila") para que no
   se confunda con un lead real.
6. Si **no** aparece ninguna fila y el formulario mostró el mensaje de
   error ("En este momento no pudimos enviar tu solicitud..."), revisa:
   - Que la URL pegada en el paso 4 sea exactamente la que te dio Google
     (sin espacios de más, terminando en `/exec`).
   - Que hayas completado el paso 3 (implementar como Web App con acceso
     "Cualquier usuario"), no solo guardado el código.

---

## 6. (Opcional, no bloqueante) Meta Pixel

`campaign.html` también tiene un lugar reservado para el ID de Meta Pixel
(`META_PIXEL_ID`), para medir conversiones de campañas pagadas en Meta
Ads. Es completamente opcional — el formulario funciona sin esto. Si más
adelante quieres activarlo, ese ID se obtiene desde Meta Business Manager
→ Orígenes de datos → Píxeles, y se pega de la misma forma que la URL de
Google Sheets, reemplazando `{{META_PIXEL_ID}}` en `campaign.html`.

---

## Resumen de lo que NO necesitas

- No necesitas ninguna tarjeta de crédito ni suscripción — Google Sheets y
  Apps Script son gratuitos para este volumen de uso.
- No necesitas GoHighLevel ni ninguna otra plataforma de CRM.
- No necesitas saber programar — solo copiar y pegar en los pasos
  indicados.
- No necesitas compartir tu hoja de cálculo con nadie para que el
  formulario funcione — el Apps Script actúa como intermediario.
