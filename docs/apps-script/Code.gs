/**
 * Fase F7.7 — Google Apps Script Web App para capturar leads de campaign.html
 * directamente en Google Sheets, sin depender de GoHighLevel ni de ninguna
 * otra plataforma de pago.
 *
 * QUÉ HACE (escritura, Fase F7.7 — SIN CAMBIOS EN ESTA FASE):
 *   1. Recibe un POST desde campaign.html (ver docs/google-sheets-leads-setup.md
 *      para cómo publicarlo y obtener la URL).
 *   2. Valida que traiga los campos mínimos obligatorios (nombre, whatsapp).
 *   3. Agrega una fila nueva a la hoja activa con las 11 columnas exactas
 *      que espera este proyecto (ver el orden exacto más abajo).
 *   4. Responde JSON: { ok: true } en éxito, { ok: false, error: "..." } en
 *      fallo — nunca expone detalles internos del error.
 *
 * QUÉ HACE (lectura, Fase LAZY V2.6-B — NUEVO):
 *   5. El MISMO doPost(e), cuando el body trae "action": "read_lead",
 *      busca UN lead específico por su lead_id y lo devuelve como JSON —
 *      NUNCA la hoja completa. Protegido por un secreto (ver más abajo).
 *      Es una capacidad ADICIONAL, no reemplaza nada de lo anterior: un
 *      request sin "action" (el que ya envía campaign.html) sigue
 *      ejecutando EXACTAMENTE la misma ruta de creación de siempre.
 *
 * NO hace nada más: no envía emails, no llama a APIs externas, no guarda
 * ningún dato fuera de la hoja de cálculo a la que está atado este script.
 * La ruta de lectura NUNCA llama a appendRow/setValues/deleteRow/clear —
 * solo getDataRange().getValues() (Fase LAZY V2.6-B §"SOLO LECTURA").
 *
 * -----------------------------------------------------------------------
 * SOBRE EL CONTENT-TYPE "text/plain" (léase antes de "corregir" esto)
 * -----------------------------------------------------------------------
 * campaign.html envía el POST con cabecera "Content-Type: text/plain" a
 * propósito, NO por error. Los Web Apps de Google Apps Script no manejan
 * bien el preflight CORS (OPTIONS) que el navegador dispara automáticamente
 * cuando el Content-Type es "application/json". Usando "text/plain" el
 * navegador lo trata como "simple request" y NUNCA envía el preflight —
 * evita el modo de falla más común de este tipo de integración.
 *
 * El *cuerpo* del mensaje SIGUE siendo JSON de todas formas — por eso este
 * script hace JSON.parse(e.postData.contents) sin mirar la cabecera
 * declarada. Esto es intencional y no debe "corregirse" a
 * e.postData.type === "application/json".
 *
 * -----------------------------------------------------------------------
 * FASE LAZY V2.6-B — POR QUÉ LA LECTURA TAMBIÉN ES UN doPost, NO UN doGet
 * -----------------------------------------------------------------------
 * El diseño original de esta fase proponía un doGet(e) con la clave
 * "Authorization: Bearer <SECRET>" como cabecera HTTP. Se auditó esa idea
 * ANTES de implementarla y se descartó por una limitación real y
 * verificable de la plataforma, no por preferencia: el objeto de evento
 * `e` que Apps Script entrega a doGet(e)/doPost(e) SOLO expone
 * `e.parameter` / `e.parameters` (query string) y, en doPost, `e.postData`
 * (el body) — NO existe ningún `e.headers` en la API de Web Apps de Apps
 * Script. Un header "Authorization: Bearer ..." enviado por el cliente
 * jamás llega al código de este script; no hay forma de leerlo.
 *
 * La alternativa "poner el secreto en la URL" (?secret=...) fue
 * explícitamente la última opción a considerar (Fase V2.6-B: "las URLs
 * pueden terminar en logs, historiales o herramientas de monitoreo").
 *
 * Por eso la lectura viaja como POST, con el secreto DENTRO del body JSON
 * (nunca en la URL, nunca en un header que de todas formas no llegaría) —
 * reutilizando el ÚNICO punto de entrada que ya existe (doPost), sin
 * agregar una segunda URL ni tocar doGet(e) en absoluto.
 *
 * -----------------------------------------------------------------------
 * SECRETO DE LECTURA — PropertiesService, NUNCA en este archivo
 * -----------------------------------------------------------------------
 * El secreto que protege "read_lead" se guarda ÚNICAMENTE como Script
 * Property (Apps Script → ⚙️ Configuración del proyecto → Propiedades del
 * script → agregar propiedad "LAZY_READ_SECRET"). Este archivo nunca lo
 * contiene, nunca lo imprime con Logger.log, nunca lo devuelve en ninguna
 * respuesta (ni siquiera en un mensaje de error). Si la propiedad no está
 * configurada, "read_lead" queda deshabilitado por completo (mismo error
 * genérico que un secreto incorrecto — nunca se revela si la causa fue
 * "no configurado" o "secreto equivocado").
 *
 * -----------------------------------------------------------------------
 * VOCABULARIO DE ERROR (5 códigos, canónico para TODO el doPost)
 * -----------------------------------------------------------------------
 * missing_required_fields | read_not_authorized | lead_not_found |
 * headers_mismatch | internal_error. Ninguna respuesta de error expone
 * stack trace, nombres internos, credenciales, secretos, ni datos de
 * otras filas — siempre uno de estos 5 códigos, nada más.
 *
 * -----------------------------------------------------------------------
 * ESTRUCTURA DE COLUMNAS DE LA HOJA (orden exacto, fila 1 = encabezados)
 * -----------------------------------------------------------------------
 * A: Timestamp | B: Nombre | C: WhatsApp | D: Email | E: Presupuesto
 * F: Contexto | G: Origen | H: UTM Source | I: UTM Medium
 * J: UTM Campaign | K: UTM Content
 *
 * Ver docs/google-sheets-leads-setup.md para cómo crear esta hoja paso a
 * paso, incluyendo los encabezados exactos a escribir en la fila 1.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "empty_request" });
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: "invalid_json" });
    }

    // Fase LAZY V2.6-B -- despacho ADITIVO. Cualquier request SIN
    // "action" (el que ya envía campaign.html desde F7.7) cae directo a
    // la ruta de creación de siempre, sin ningún cambio de comportamiento.
    if (data && data.action === "read_lead") {
      return handleReadLead(data);
    }

    // ------------------------------------------------------------------
    // RUTA DE CREACIÓN -- Fase F7.7, EXACTAMENTE IGUAL, sin modificar.
    // ------------------------------------------------------------------

    // Validación mínima -- solo los dos campos que campaign.html ya exige
    // como obligatorios en el propio formulario (nombre y whatsapp).
    if (!data.nombre || !data.whatsapp) {
      return jsonResponse({ ok: false, error: "missing_required_fields" });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nombre || "",
      data.whatsapp || "",
      data.email || "",
      data.presupuesto || "",
      data.contexto || "",
      data.origen || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    // Nunca se expone err.message ni el stack al cliente -- solo un código
    // genérico. El detalle real queda en el registro de ejecuciones del
    // propio Apps Script (Ejecuciones, en el editor), visible solo para
    // quien administra la hoja.
    return jsonResponse({ ok: false, error: "internal_error" });
  }
}

/**
 * GET es opcional -- solo sirve para poder abrir la URL del Web App en el
 * navegador y confirmar visualmente que está publicado y responde, sin que
 * eso agregue ninguna fila a la hoja. Fase LAZY V2.6-B: SIN CAMBIOS -- la
 * lectura de leads vive en doPost (ver docstring del archivo), doGet(e)
 * sigue siendo exclusivamente este mensaje informativo.
 */
function doGet(e) {
  return jsonResponse({ ok: true, info: "LAZZY / JOSS DESXGN lead capture — listo para recibir POST." });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===========================================================================
// FASE LAZY V2.6-B — LECTURA DE UN LEAD ESPECÍFICO (SOLO LECTURA)
// ===========================================================================

/**
 * Encabezados EXACTOS de la hoja (Fase F7.7 §6) -- se usan para mapear
 * cada columna sin asumir un orden fijo de getValues(), y para poder
 * detectar con un error explícito ("headers_mismatch") si alguien alteró
 * los encabezados de la fila 1 sin querer.
 */
var EXPECTED_HEADERS = [
  "Timestamp", "Nombre", "WhatsApp", "Email", "Presupuesto",
  "Contexto", "Origen", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content",
];

function handleReadLead(data) {
  var expectedSecret = PropertiesService.getScriptProperties().getProperty("LAZY_READ_SECRET");

  // Si no hay secreto configurado, "read_lead" queda deshabilitado --
  // MISMO error genérico que un secreto incorrecto, nunca se distingue
  // la causa (evita revelar si la función está "casi lista" o no).
  var providedSecret = data.secret;
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, error: "read_not_authorized" });
  }

  var leadId = data.lead_id;
  if (!leadId || typeof leadId !== "string") {
    // Fase LAZY V2.6-B -- vocabulario de error CANÓNICO (5 códigos, ver
    // docstring del archivo): un lead_id ausente es, conceptualmente, el
    // mismo tipo de problema que nombre/whatsapp ausentes en la ruta de
    // creación -- reutiliza el mismo código en vez de inventar uno nuevo.
    return jsonResponse({ ok: false, error: "missing_required_fields" });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // SOLO LECTURA -- getDataRange().getValues() nunca escribe nada. No hay
  // ninguna otra llamada a la hoja en esta función.
  var values = sheet.getDataRange().getValues();
  if (values.length < 1) {
    // Sin siquiera una fila de encabezados -- mismo código que un
    // encabezado esperado faltante, es la misma familia de problema.
    return jsonResponse({ ok: false, error: "headers_mismatch" });
  }

  var headers = values[0];
  for (var h = 0; h < EXPECTED_HEADERS.length; h++) {
    if (headers.indexOf(EXPECTED_HEADERS[h]) === -1) {
      // Encabezado esperado no encontrado -- se detiene con un error
      // explícito en vez de adivinar posiciones de columna.
      return jsonResponse({ ok: false, error: "headers_mismatch" });
    }
  }

  var col = {};
  for (var c = 0; c < headers.length; c++) {
    col[headers[c]] = c;
  }

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var timestampStr = formatTimestampValue(row[col["Timestamp"]]);
    var whatsappStr = String(row[col["WhatsApp"]] || "");
    var computedId = computeLeadId(timestampStr, whatsappStr);

    if (computedId === leadId) {
      return jsonResponse({
        ok: true,
        lead: {
          timestamp: timestampStr,
          nombre: String(row[col["Nombre"]] || ""),
          whatsapp: whatsappStr,
          email: String(row[col["Email"]] || ""),
          presupuesto: String(row[col["Presupuesto"]] || ""),
          contexto: String(row[col["Contexto"]] || ""),
          origen: String(row[col["Origen"]] || ""),
          utm_source: String(row[col["UTM Source"]] || ""),
          utm_medium: String(row[col["UTM Medium"]] || ""),
          utm_campaign: String(row[col["UTM Campaign"]] || ""),
          utm_content: String(row[col["UTM Content"]] || ""),
        },
      });
    }
  }

  return jsonResponse({ ok: false, error: "lead_not_found" });
}

/**
 * La columna Timestamp se guarda como el string ISO 8601 que envía
 * campaign.html (Fase F7.7). Google Sheets, según el formato de celda,
 * PUEDE llegar a interpretarlo como una fecha real en vez de texto plano
 * -- si eso pasa, getValues() devuelve un objeto Date de JavaScript en
 * vez del string original. Esta función normaliza ambos casos de vuelta
 * a ISO 8601 para que computeLeadId() reciba siempre la misma forma.
 *
 * LIMITACIÓN CONOCIDA (declarada en el reporte de la fase, no oculta):
 * si Sheets convirtió el valor a Date, `.toISOString()` reconstruye un
 * instante válido, pero no hay garantía matemática de que sea
 * BYTE-A-BYTE idéntico al string original que campaign.html envió
 * (precisión de milisegundos, interpretación de zona horaria) -- lo cual
 * cambiaría el lead_id calculado aquí respecto al que Python calculó en
 * el momento del envío original. No fue posible verificar empíricamente
 * en este entorno si Sheets realiza esa conversión para este formato
 * específico (ver reporte, sección de limitaciones).
 */
function formatTimestampValue(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return value.toISOString();
  }
  return String(value || "");
}

/**
 * Espejo del lead_id de Fase LAZY V2.6-A (core/lead_reader.py::make_lead_id):
 * sha256(timestamp + "|" + whatsapp), primeros 16 caracteres hex.
 * Utilities.computeDigest() devuelve bytes CON signo (-128..127) -- se
 * convierten a su equivalente sin signo (0..255) antes de formatear cada
 * uno como hex de 2 dígitos, para producir el mismo hexdigest que
 * Python's hashlib.sha256(...).hexdigest().
 */
function computeLeadId(timestamp, whatsapp) {
  var basis = String(timestamp) + "|" + String(whatsapp);
  var digestBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, basis, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < digestBytes.length; i++) {
    var unsigned = digestBytes[i] < 0 ? digestBytes[i] + 256 : digestBytes[i];
    var h = unsigned.toString(16);
    hex += (h.length === 1 ? "0" + h : h);
  }
  return hex.substring(0, 16);
}
