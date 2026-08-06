# DOCUMENTACIÓN TÉCNICA Y ESTRATÉGICA
## DROP 01 — SUBMERGED / OJ0$$ (OJOSS Publicity)

> **Nota:** Este archivo contiene la documentación completa del proyecto de landing page para el DROP 01 de la marca OJ0$$ integrada con GoHighLevel CRM.

---

## ÍNDICE

1. [Objetivo del proyecto](#1-objetivo-del-proyecto)
2. [Objetivo comercial](#2-objetivo-comercial)
3. [Concepto de marca](#3-concepto-de-marca)
4. [Arquitectura del sitio](#4-arquitectura-del-sitio)
5. [Funnel de conversión](#5-funnel-de-conversión)
6. [Diseño e identidad visual](#6-diseño-e-identidad-visual)
7. [Desarrollo técnico](#7-desarrollo-técnico)
8. [Funcionalidades implementadas](#8-funcionalidades-implementadas)
9. [Funcionalidades pendientes](#9-funcionalidades-pendientes)
10. [Decisiones importantes](#10-decisiones-importantes)
11. [Roadmap](#11-roadmap)
12. [Contexto completo para handoff](#12-contexto-completo-para-handoff)

---

## 1. Objetivo del proyecto

### ¿Qué estamos construyendo?

Una **landing page experiencia cinematográfica** para el lanzamiento limitado de camisetas **DROP 01 — SUBMERGED** de la marca **OJ0$$** (OJOSS Publicity, Cúcuta, Colombia). No es una tienda convencional: es un recorrido inmersivo con efectos glitch/cyberpunk que selecciona al visitante culturalmente antes de mostrarle el producto.

El sitio vive como un overlay fullscreen sobre la web del estudio **JOSS DESXGN**, haciendo que ambas identidades —el estudio creativo y la marca streetwear— compartan una sola URL sin rutas separadas.

### Propósito principal

Capturar **pre-orders** de una colección de exactamente 20 camisetas de edición limitada. El usuario debe completar un recorrido completo (intro cinematográfica → galería → selección → formulario → pago Nequi) antes de confirmar su unidad.

### Problema que resuelve

Los canales habituales (Instagram, Shopify genérico, WhatsApp) no pueden comunicar la identidad underground de OJ0$$. Esta experiencia **filtra por cultura**: solo quien tiene resonancia con la estética completa el flujo. El proceso de compra es parte del producto.

> **Frase clave del proyecto:** "NO ES UNA COMPRA. ES UNA ENTRADA." — S06 success screen

---

## 2. Objetivo comercial

### Producto

| Variante | ID | Precio | Stock total |
|---|---|---|---|
| VOID | `001` | COP $58.000 | 20 unidades entre los 3 diseños |
| STATIC | `002` | COP $58.000 | — |
| INVERTED | `003` | COP $58.000 | — |

### Modelo de negocio

**Drop limitado con escasez real.** 20 unidades totales, 7 días de ventana. El pago es manual vía Nequi: el comprador transfiere $58.000 COP y envía captura del comprobante. La marca confirma por WhatsApp antes del despacho.

Cuando se agotan las 20 unidades **o** pasan 7 días, el acceso al drop se cierra automáticamente (`checkUnlock()` en JS).

### Cliente ideal

- Jóvenes 16–28 años en Cúcuta y ciudades cercanas
- Identidad streetwear/underground, cultura urbana colombiana
- Activos en Instagram, conocen el formato drop (Supreme, VLONE, marcas locales)
- Llegan por tráfico orgánico/referido, ya conocen OJ0$$ por redes
- Tienen Nequi instalado y saben usarlo

### Acción esperada

```
Seleccionar diseño → Seleccionar talla → Llenar formulario → Pagar Nequi → Confirmar por WhatsApp
```

---

## 3. Concepto de marca

### Identidad

| Elemento | Valor |
|---|---|
| Nombre de marca | OJ0$$ (se lee "Ojoss") |
| Empresa | OJOSS Publicity |
| Ciudad | Cúcuta, Colombia |
| Estudio detrás | JOSS DESXGN |

### Propuesta de valor

OJ0$$ no vende camisetas: vende pertenencia a una comunidad con identidad visual propia. Cada drop es un evento con nombre propio (SUBMERGED), concepto (tres arquetipos: VOID / STATIC / INVERTED), y acceso exclusivo.

### Diferenciadores frente a otras marcas locales

- La experiencia de compra es una obra en sí misma
- Nomenclatura propia: arquetipos numerados 001/002/003 en lugar de "diseño A/B/C"
- Lenguaje propio: "ASEGURAR MI UNIDAD", "ENTRADA", "UNIDAD ASEGURADA" en vez de lenguaje genérico de e-commerce
- Sin stock permanente — cada drop es único e irrepetible

### Personalidad y tono

- **Tono:** Imperativo. Corto. Mayúsculas. Sin explicaciones innecesarias.
- **Ejemplos:** `"NO TODOS ENTRAN."` / `"NOS VEMOS EN EL DROP."` / `"SOLO 20 UNIDADES — 7 DÍAS"`
- **Anti-referencias:** Sin colores pastel, sin tipografías amigables, sin "¡Compra ahora!", sin lifestyle sonriente

### Referencias visuales

- Cultura hacker/terminal: lluvia binaria, scanlines, monoespaciado verde sobre negro
- Glitch art: VHS artifacts, RGB channel split, clip-path slicing horizontal
- Streetwear de alta producción: Supreme, A-COLD-WALL*, Yeezy — austeridad y negro profundo
- Cine industrial: A24, Enter the Void — oscuridad extrema, tipografía blanca sobre negro

---

## 4. Arquitectura del sitio

### Estructura de dos capas en un único archivo HTML

```
CAPA 1 — OVERLAY DROP 01 (z-index: 9999, position: fixed, background: #030303)
#oj-overlay
│
├── [#oj-entrance]  Cinematic intro (z-index: 200)
│     ├── STEP 1  Logo + OJ0$$           (0s – 3.5s)
│     ├── STEP 2  Gallery SUBMERGED      (3.5s – 9.5s)
│     ├── STEP 3  Tres arquetipos        (9.5s – 15.5s)
│     └── STEP 4  CTA "ENTRAR"           (15.5s+)
│
├── [#oj-s01]  .active  → Logo con glitch RGB + parallax
├── [#oj-s02]           → Gallery + botón ENTRAR + carousel automático
├── [#oj-s03]           → Coverflow product selector
├── [#oj-s05]           → Formulario CASI LISTO → paso Nequi
└── [#oj-s06]           → Pantalla SUCCESS

CAPA 2 — STUDIO JOSS DESXGN (visible tras unlock)
Hero cinematic → Stats → Services → Work → About → Contact → Footer
```

### Secciones del overlay

#### `#oj-entrance` — Cinematic Intro
Presentación de marca antes del drop. 4 steps con animaciones CSS puras (sin JS). Auto-play. El usuario puede skippearlo con VER DROP o ENTRAR en cualquier momento.

#### `#oj-s01` — Logo OJ0$$
Logo con animación `oj-glitch` (RGB split + clip-path + skewX). Auto-timer de 3.5s navega automáticamente a S02. Parallax en mousemove.

#### `#oj-s02` — Gallery SUBMERGED
Carousel automático de 3 slides (label-detail, VOID, INVERTED). Avance cada 4s. Título "SUBMERGED / DROP 01". Botón **ENTRAR** + claim "SOLO 20 UNIDADES — 7 DÍAS".

#### `#oj-s03` — Product Selector (Coverflow)
Núcleo del drop. Coverflow de 3 slides drag/swipe. Toggle frente/espalda por slide. Precio auto-reveal. Glow pulse en tallas. ASEGURAR MI UNIDAD sobre imagen al elegir talla.

#### `#oj-s05` — CASI LISTO (Formulario + Nequi)
**S05-A:** Formulario de captura (nombre + WhatsApp obligatorios, Instagram + email opcionales).  
**S05-B:** Paso Nequi con monto $58.000 COP, número de cuenta y botón YA HICE EL PAGO.

#### `#oj-s06` — UNIDAD ASEGURADA (Success)
Número de unidad en grande, frases de cierre, firma de marca, botón ENTRAR AL SITIO que desbloquea el estudio.

### Assets disponibles

```
assets/
├── logo.png            # Logo OJ0$$ — S01 y entrance Step1
├── 001-back.png        # VOID espalda — S02 carousel + S03 coverflow
├── 001-front.png       # VOID frente — S03 toggle
├── 002-back.jpg        # STATIC espalda — S03
├── 002-front.jpg       # STATIC frente — S03 toggle
├── 003-back.jpg        # INVERTED espalda — S02 + S03
├── 003-front.jpg       # INVERTED frente — S03 toggle
├── label-detail.jpg    # Detalle etiqueta — S02 primer slide + entrance
├── banner.png          # Banner editorial — hero studio JOSS DESXGN
├── hero-banner.jpg     # Hero alternativo (verificar uso)
└── hero-banner.png     # Hero alternativo (verificar uso)
```

---

## 5. Funnel de conversión

### Recorrido completo del usuario

1. **Llegada** → El body se bloquea (`body.oj-locked`). El overlay toma pantalla completa.

2. **Cinematic Intro** (`#oj-entrance`) → 4 steps CSS auto-play ~15s total.
   - Step 1: Logo + OJ0$$ gigante
   - Step 2: Galería + SUBMERGED
   - Step 3: Los 3 arquetipos
   - Step 4: "NO TODOS ENTRAN." + botón ENTRAR

3. **S01 — Logo** → Glitch RGB al aparecer. Auto-timer 3.5s → S02.

4. **S02 — Gallery** → Carousel + botón **ENTRAR** (CTA principal).

5. **Transición Glitch** → `triggerGlitch()`: overlay binario 1.85s → S03.

6. **S03 — Coverflow** → Animación de título → Seleccionar camisa (precio aparece + tallas pulsan verde) → Seleccionar talla → **ASEGURAR MI UNIDAD** aparece sobre imagen con glitch.

7. **Flash S03** → `fireS03Flash()`: flash verde fullscreen 1.38s + "// UNIDAD ASEGURADA //" → S05.

8. **S05-A — Formulario** → Validación → submit → payload a GHL webhook → paso Nequi.

9. **S05-B — Nequi** → Monto $58.000 COP + número de cuenta + botón **YA HICE EL PAGO**.

10. **S06 — Success** → Número de unidad + frases de cierre → **ENTRAR AL SITIO** → unlock.

### Llamados a la acción (CTAs)

| Sección | CTA | Acción |
|---|---|---|
| Entrance Step 1 | VER DROP → | Skip intro → unlock site |
| Entrance Step 4 | ENTRAR | Skip intro → unlock site |
| S02 | ENTRAR | Trigger glitch → S03 |
| S03 | ASEGURAR MI UNIDAD | Flash → S05 |
| S05-A | SIGUIENTE — PAGAR | Submit form → Nequi |
| S05-B | YA HICE EL PAGO → | → S06 |
| S06 | ENTRAR AL SITIO | Unlock → studio JOSS DESXGN |

### Payload GHL enviado al webhook

```json
{
  "firstName":    "nombre del usuario",
  "phone":        "whatsapp del usuario",
  "email":        "email (opcional)",
  "instagram":    "@handle (opcional)",
  "drop":         "DROP-01-SUBMERGED",
  "variant":      "001 | 002 | 003",
  "size":         "XS | S | M | L | XL",
  "tags":         ["drop-01", "pre-order", "oj0s-merch", "variant-001", "talla-m"],
  "fuente_lead":  "drop01-overlay",
  "locationId":   "333wInB2HFhaOLdPcjRJ",
  "source":       "DROP 01 — SUBMERGED"
}
```

### Automatizaciones previstas (GHL)

- Contacto creado/actualizado con todos los datos del formulario
- Tags añadidos: `drop-01`, `pre-order`, `oj0s-merch`, `variant-00X`, `talla-X`
- Oportunidad creada en pipeline "DROP-01-SUBMERGED"
- Mensaje WhatsApp de confirmación automático (pendiente — API fallback)
- Contador real de reservas consultado desde GHL al cargar (pendiente)

---

## 6. Diseño e identidad visual

### Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| Background overlay | `#030303` | Fondo del overlay drop |
| Background studio | `#080808` | Fondo del studio JOSS DESXGN |
| Surface | `#0A0A0A / #111111` | Tarjetas, inputs |
| Border | `#141414 – #222222` | Bordes y divisores |
| **Green** | **`#22C55E`** | **Acción, confirmación, chispas, pulse** |
| Green glow | `rgba(34,197,94,0.45)` | Box-shadow en estados activos |
| **Gold** | **`#C9A96E`** | **Acentos secundarios, número Nequi** |
| White | `#EFEFEF` | Texto principal |
| Muted | `#333 – #555` | Texto secundario, labels |

> **Regla del verde:** El verde `#22C55E` es el único color de acción en todo el overlay. Siempre señala una acción disponible o una confirmación exitosa.

### Tipografía

| Rol | Familia | Peso | Uso |
|---|---|---|---|
| Display | Barlow Condensed | 800 / 900 | SELECCIONA, DROP 01, SUBMERGED, títulos grandes |
| Body | Inter | 300 / 400 / 600 / 700 | Toda la interfaz funcional, labels, botones |
| Terminal | Space Mono / Courier New | 400 | Lluvia binaria de la transición glitch |

**Convenciones tipográficas del overlay:**
- Todo en MAYÚSCULAS para CTAs y labels
- Letter-spacing extremo en labels pequeños: `0.3em – 0.55em`
- Letter-spacing negativo en títulos grandes: `-0.03em a -0.05em`
- Font-weight 300 para texto muted (contraste extremo con 900 de títulos)

### Animaciones

| Nombre | Descripción | Duración | Activador |
|---|---|---|---|
| `oj-glitch` | RGB split + clip-path slices horizontales + skewX en el logo | 1.4s | Auto al aparecer S01 |
| `triggerGlitch()` | Overlay binario (JS: 1200 chars random, refresh 80ms) + capas RGB + texto SUBMERGED | 1.85s | Clic ENTRAR (S02→S03) |
| `enterS03()` | Secuencia: SELECCIONA slide-up → línea verde extiende → TU DISEÑO FAVORITA | ~1s | Al navegar a S03 |
| `fireS03Flash()` | Flash verde→blanco→negro + RGB layers + "// UNIDAD ASEGURADA //" | 1.38s | Clic ASEGURAR MI UNIDAD |
| `cta-glitch-in` | Entrada glitch del botón ASEGURAR sobre la imagen | 0.72s | 180ms tras elegir talla |
| `size-ready` | Pulse glow verde infinito en botones de talla | Infinito | Al seleccionar una camiseta |
| `spark-pop` | Chispa verde en flechas del carousel | 0.4s | Clic flechas ← → |
| `ent-fadeinout` | Fade-in/out de cada step de la intro cinematográfica | 3.5s–6s | Automático al cargar |

---

## 7. Desarrollo técnico

### Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS (ES5) | Sin build step, máxima compatibilidad móvil |
| Deploy | Vercel (static) | Auto-deploy desde GitHub main, cero config |
| VCS | GitHub (`jossreloadrandom-alt/JO-DESXGN`) | Branch main → auto-deploy |
| CRM | GoHighLevel via MCP + REST API v2 | 36 herramientas MCP activas |
| Fuentes | Google Fonts CDN | Barlow Condensed + Inter |

### Estructura de archivos

```
z:\Documentos\Gohighlevel\
├── INICIO.md                               # Punto de entrada del sistema documental
├── JOSS_DESXGN.md                          # Identidad del estudio
├── SKIN_SYSTEM.md                          # Canon metodológico
├── index.html                              # TODO el proyecto (~3.900 líneas)
├── .mcp.json                               # Config MCP GHL (tokens via env vars)
├── CLAUDE.md                               # Instrucciones para Claude Code
├── proyectos\
│   └── 001_OJ0SS_DROP01.md                # Este archivo
├── _ARCHIVO\
│   ├── SKIN_SYSTEM_FUNDACIONAL_v2.0.md
│   ├── SKIN_SYSTEM_REPORTE_CRITICO_001.md
│   └── DIARIO_DIRECTOR_001.md
└── assets\
    ├── logo.png
    ├── 001-back.png / 001-front.png
    ├── 002-back.jpg / 002-front.jpg
    ├── 003-back.jpg / 003-front.jpg
    ├── label-detail.jpg
    └── banner.png
```

### Estructura de `index.html`

```
Líneas 1–11       → <head>: meta, title, Google Fonts CDN
Líneas 12–900     → <style> #1: CSS completo del studio JOSS DESXGN
Líneas 900–2.235  → <style> #2: CSS del overlay DROP 01
                    (keyframes, secciones, carousel, flash, glitch, entrance)
Líneas 2.237–2.519 → HTML del overlay (#oj-overlay + #oj-entrance)
Líneas 2.235–2.725 → HTML del studio JOSS DESXGN
Líneas 2.726–3.400 → <script>: IIFE con toda la lógica del drop
```

### JavaScript — IIFE principal

```javascript
(function () {
  'use strict';

  /* ── CONFIG ── */
  var DROP_WEBHOOK  = '{{DROP_WEBHOOK_URL}}';    // PENDIENTE: URL webhook GHL
  var TOTAL_UNITS   = 20;
  var DROP_DURATION = 7 * 24 * 60 * 60 * 1000;  // 7 días en ms

  /* ── STATE ── */
  var currentVariant = '001';        // cambia con goS03Slide()
  var currentSize    = null;         // cambia con selectSize()
  var reserved       = parseInt(localStorage.getItem('oj_drop01_count') || '0', 10);
  var dropStart      = parseInt(localStorage.getItem('oj_drop01_start')  || '0', 10);

  /* ── FUNCIONES PRINCIPALES ── */
  // goTo(id)             → cambia .active entre secciones
  // runEntrySequence()   → inicia auto-timer S01→S02 (3.5s)
  // triggerGlitch(cb)    → overlay binario + callback
  // enterS03()           → animación secuencial del título + carousel reset
  // goS03Slide(n, anim)  → mueve el coverflow, resetea tallas
  // selectSize(s)        → arma el botón ASEGURAR MI UNIDAD
  // fireS03Flash(cb)     → flash verde fullscreen + navega a S05
  // submitDrop(e)        → valida + envía payload + muestra Nequi
  // unlockSite()         → quita overlay, muestra studio

  /* ── API PÚBLICA ── */
  // window.OJ_DROP.setReserved(n)  → fija contador (debug/integración GHL)
  // window._s03ResetCarousel()     → resetea carousel a slide 0 (Playwright)
})();
```

### Coverflow — lógica de posicionamiento

```javascript
var SLIDE_W = 76;                          // flex: 0 0 76% en CSS
var ORIGIN  = (100 - SLIDE_W) / 2;        // = 12 — centra el slide 0

// Posición del track para el slide n:
translateX(ORIGIN - n * SLIDE_W)%
// n=0 → translateX(12%)   → slide 0 centrado
// n=1 → translateX(-64%)  → slide 1 centrado
// n=2 → translateX(-140%) → slide 2 centrado
```

### GHL MCP — Configuración

```json
// .mcp.json
{
  "mcpServers": {
    "ghl": {
      "type": "http",
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GHL_TOKEN}",
        "locationId": "${GHL_LOCATION_ID}"
      }
    }
  }
}
```

### Variables de entorno requeridas (PowerShell)

```powershell
$env:GHL_TOKEN       = "pit_xxxxxxxxxxxxxxxxxxxx"
$env:GHL_LOCATION_ID = "333wInB2HFhaOLdPcjRJ"     # Jo$$ publicity, Cucuta CO
```

### Design tokens CSS (`:root`)

```css
/* Studio JOSS DESXGN */
--bg:          #080808;
--surface:     #111111;
--border:      #222222;
--gold:        #C9A96E;
--green:       #22C55E;
--green-glow:  rgba(34,197,94,0.45);
--white:       #F0F0F0;
--muted:       #6A6A6A;
--font:        'Inter', system-ui, sans-serif;

/* El overlay usa valores levemente distintos (inline en su <style>) */
/* background: #030303  |  texto: #EFEFEF  |  border: #141414–#1e1e1e */
```

---

## 8. Funcionalidades implementadas

- [x] **Intro cinematográfica `#oj-entrance`** — 4 steps CSS con fade-in/out escalonado, animaciones de texto, parallax en step 1, galería en step 2, showcase 3 variantes en step 3, CTA en step 4
- [x] **Logo OJ0$$ con glitch RGB (S01)** — Animación `oj-glitch` al aparecer: 3 beats con clip-path slices horizontales, channel split rojo/cian, skewX, scaleX. Auto-timer 3.5s
- [x] **Gallery S02 con carousel automático** — 3 slides, auto-advance 4s, flechas y dots manuales, título SUBMERGED/DROP 01, botón ENTRAR
- [x] **Transición glitch binario (S02→S03)** — `triggerGlitch()`: overlay negro, lluvia de 0/1 flickeando (80ms interval), capas RGB con clip-path animado, texto SUBMERGED central. 1.85s
- [x] **Título animado S03** — SELECCIONA slide-up → línea verde extiende → TU DISEÑO FAVORITA fade-up (secuencia con delays)
- [x] **Coverflow carousel (S03)** — 3 slides, CSS flex 76%, offset ORIGIN=12%. Laterales: scale(0.86) + blur(2.5px) + brightness(0.4). Drag mouse + swipe táctil
- [x] **Toggle frente/espalda per-slide** — Botón esquina inferior derecha, solo activo en slide central
- [x] **Precio auto-reveal al seleccionar camisa** — `activatePriceAndSizes()`: fade-up $58.000 COP + glow pulse en tallas
- [x] **Size buttons glow pulse** — Clase `ready`: borde verde + animación `size-ready` 1.8s infinito. Para al elegir talla
- [x] **ASEGURAR MI UNIDAD sobre imagen** — Posición absoluta centrada (top:50%, left:50%). backdrop-filter:blur(14px), borde verde. Entrada `cta-glitch-in` a los 180ms
- [x] **Flash de confirmación `fireS03Flash()`** — `#s03-flash`: capas .s03f-green (verde→blanco→negro), .s03f-rgb-a/.b (clip-path), .s03f-scan (scanlines), .s03f-msg (texto con variante). Reset por reflow
- [x] **Formulario CASI LISTO (S05)** — 4 campos, validación nombre+whatsapp, mensaje de error inline
- [x] **Payload GHL estructurado** — firstName, phone, email, instagram, drop, variant, size, tags (5), fuente_lead, locationId, source
- [x] **Paso Nequi (S05-B)** — Monto $58.000 COP, placeholder del número, instrucciones, YA HICE EL PAGO. Botón ATRÁS vuelve al formulario
- [x] **Pantalla SUCCESS S06** — Número de unidad animado, frases de cierre, firma de marca, ENTRAR AL SITIO
- [x] **Pressure bar sticky** — Aparece tras primera reserva. Contador X/20. Mensajes por nivel de llenado
- [x] **Unlock site + float button** — `unlockSite()` fade-out overlay. Float button ENTER DROP reabre desde cualquier punto del studio
- [x] **Persistence localStorage** — Contador de reservas (`oj_drop01_count`), timestamp inicio (`oj_drop01_start`), estado unlocked (`oj_drop01_unlocked`)
- [x] **Studio JOSS DESXGN completo** — Hero cinematic con parallax, Stats bar, Services, Work, About, Contact, Footer
- [x] **GHL MCP conectado** — 36 herramientas activas. Location validada (Jo$$ publicity, Cucuta CO, ID: `333wInB2HFhaOLdPcjRJ`)
- [x] **Deploy Vercel** — Auto-deploy desde GitHub main. URL en producción: `https://jo-desxgn.vercel.app`

---

## 9. Funcionalidades pendientes

### 🔴 CRÍTICO (bloquea el lanzamiento del drop)

- [ ] **Número Nequi real** — Reemplazar `{{NEQUI_NUMBER}}` en `index.html` (div `#oj-nequi-num`)
- [ ] **URL del webhook GHL** — Reemplazar `{{DROP_WEBHOOK_URL}}` en el JS del IIFE (línea ~2733)
- [ ] **Pipeline GHL configurado** — Crear pipeline "DROP-01-SUBMERGED" y workflow que recibe webhook → crea contacto → agrega tags → crea oportunidad

### 🟡 ALTO (primeros días del drop)

- [ ] **Contador de reservas sincronizado con GHL** — El contador actual es localStorage (local al browser). Debe consultarse desde GHL al cargar para reflejar reservas reales de todos los usuarios
- [ ] **WhatsApp automático post-reserva** — Mensaje de confirmación con datos del pedido vía `POST /conversations/messages/` (API fallback GHL)

### 🟢 MEDIO/BAJO (mejoras opcionales)

- [ ] **Open Graph / meta tags** — og:image, og:title, og:description para preview en redes al compartir
- [ ] **Animación de entrada a S05** — El formulario aparece sin transición especial tras el flash
- [ ] **Analytics / pixel** — Sin tracking actualmente. Necesario antes de campañas pagadas
- [ ] **Gestión dinámica de tallas agotadas** — Actualmente todas las tallas están disponibles; sin lógica para deshabilitar tallas por inventario

---

## 10. Decisiones importantes

### ¿Por qué un solo archivo HTML (~3.400 líneas)?
Cero configuración de build, cero dependencias. Vercel despliega un HTML estático sin pasos intermedios. Todo el código es auditable en un lugar. Para un drop de 7 días con 20 unidades, la velocidad de desarrollo supera cualquier ventaja arquitectónica de React o Vue.

### ¿Por qué overlay en lugar de URLs separadas?
Una sola URL comunica ambas identidades: el estudio profesional y la marca streetwear. El overlay fullscreen (z-index: 9999) toma control sin rutas separadas. La experiencia de "desbloquear" el sitio funciona mejor con una URL que el usuario puede compartir.

### ¿Por qué pago Nequi manual en lugar de pasarela?
Integrar PayU/Wompi requiere empresa registrada con RUT y proceso de verificación (días/semanas). Nequi es inmediato, lo conoce el 100% del cliente objetivo, y el volumen de 20 unidades hace que la verificación manual sea completamente manejable.

### ¿Por qué JavaScript ES5 (var, function)?
Maximizar compatibilidad sin transpilación. Clientes en Cúcuta pueden tener móviles de gama baja con browsers no actualizados. ES5 funciona en todos sin Babel.

### ¿Por qué el contador usa localStorage?
Para el MVP fue suficiente y se implementó en minutos. La limitación conocida: cada browser tiene su propio contador. La sincronización real vendrá del webhook GHL cuando esté configurado.

### ¿Por qué los efectos de glitch son CSS puro?
Los efectos de clip-path, transform y filter son acelerados por GPU en todos los browsers modernos. Sin librerías, sin canvas. Rendimiento equivalente a WebGL para este caso de uso, código más mantenible.

### ¿Por qué la fricción es intencional?
La intro de 15s, la transición de 1.85s, el flash de 1.38s — todo "frena" el flujo. Esa fricción es el producto: quien tiene paciencia y resonancia cultural completa el recorrido. "NO TODOS ENTRAN" es la estructura del sitio, no solo marketing.

---

## 11. Roadmap

### Fase 1 — Esta semana (para poder abrir el drop)

1. Reemplazar `{{NEQUI_NUMBER}}` con el número real
2. Crear webhook en GHL → pegar URL en `DROP_WEBHOOK_URL` → probar
3. Configurar pipeline "DROP-01" en GHL para recibir oportunidades
4. Probar flujo end-to-end en móvil real (iOS + Android) antes de publicitar

### Fase 2 — Primera semana del drop

5. WhatsApp automático de confirmación (template + workflow GHL)
6. Contador de reservas sincronizado: fetch al cargar → count de oportunidades en pipeline
7. Open Graph meta tags para preview al compartir en redes

### Fase 3 — Post DROP 01

8. Integrar pasarela de pago (Wompi Colombia) cuando haya estructura jurídica
9. Sistema multi-drop: variables de config para activar DROP 02 cambiando 4–5 líneas
10. Dashboard admin en GHL para monitorear reservas sin acceder al código

---

## 12. Contexto completo para handoff

### URLs y repositorios

| Recurso | URL |
|---|---|
| Producción | `https://jo-desxgn.vercel.app` |
| Repositorio | `https://github.com/jossreloadrandom-alt/JO-DESXGN` |
| Branch | `main` (auto-deploy a Vercel en cada push) |
| GHL Sub-cuenta | "Jo$$ publicity", Cúcuta CO |
| GHL Location ID | `333wInB2HFhaOLdPcjRJ` (hardcodeado en el JS payload) |

### Invariantes críticos — NO romper

**Navegación entre secciones:**  
Las secciones se muestran/ocultan únicamente con la clase CSS `.active` (`display: flex`). La función `goTo(id)` quita `.active` de todas y la añade a la indicada. Nunca usar `visibility:hidden` o `display:none` directamente en las secciones del overlay.

**Los dos efectos de glitch son completamente distintos:**  
- `triggerGlitch(cb)` → transición S02→S03 — overlay negro con binario (ID: `#oj-glitch`)
- `fireS03Flash(cb)` → confirmación ASEGURAR — flash verde (ID: `#s03-flash`)

**El carousel reset al cambiar de slide:**  
`goS03Slide()` llama `resetSizes()` (quita talla activa + oculta ASEGURAR) y luego `activatePriceAndSizes()` (precio aparece + tallas pulsan). El estado de talla (`currentSize`) se pierde al navegar entre camisas — esto es **diseño intencional**.

**Replay de animaciones CSS:**  
Para reproducir una animación CSS más de una vez, el patrón es:
```javascript
el.classList.remove('active');
void el.offsetWidth;  // fuerza reflow
el.classList.add('active');
```

### Variables de configuración (cabeza del IIFE)

```javascript
var DROP_WEBHOOK  = '{{DROP_WEBHOOK_URL}}';    // REEMPLAZAR con URL real
var TOTAL_UNITS   = 20;
var DROP_DURATION = 7 * 24 * 60 * 60 * 1000;
```

### Cómo cambiar el precio

Buscar en `index.html` y reemplazar en **dos lugares**:
1. `div#oj-price` (S03, línea ~2367): `<span class="oj-price__currency">COP</span> 58.000`
2. `div.oj-nequi-amount` (S05-B, línea ~2412): `<span>$</span> 58.000`

### API pública del IIFE

```javascript
// Fija el contador de reservas (sincronizar con GHL o testing)
window.OJ_DROP.setReserved(n);

// Resetea el carousel de S03 al slide 0 (Playwright y re-entrada a S03)
window._s03ResetCarousel();
```

### Herramientas MCP GHL disponibles

**Activas (36 herramientas):** contacts, opportunities, conversations, calendar, payments, locations, emails, blogs, social media.

**Bloqueada:** `GET /funnels/funnel` requiere Agency JWT token — no accesible via PIT.  
**Accesible via PIT:** `GET/POST /funnels/page` con funnelId conocido.

### Comandos de desarrollo

```bash
# Servidor local para Playwright / preview offline
python -m http.server 8765

# Deploy: solo push a main — Vercel hace el resto
git add index.html
git commit -m "descripción del cambio"
git push origin main
```

```powershell
# Activar MCP GHL (PowerShell — requerido antes de iniciar Claude Code)
$env:GHL_TOKEN       = "pit_xxxxxxxxxxxxxxxxxxxx"
$env:GHL_LOCATION_ID = "333wInB2HFhaOLdPcjRJ"
```

### Lo único que bloquea abrir el drop

Dos búsquedas en `index.html`:

```
1. Buscar: {{NEQUI_NUMBER}}
   Reemplazar con: el número de Nequi real de OJOSS Publicity

2. Buscar: {{DROP_WEBHOOK_URL}}
   Reemplazar con: la URL del webhook de GoHighLevel
```

Con esos dos reemplazos, el drop está operativo.

---

*Documentación generada el 2026-08-03 — proyecto DROP 01 SUBMERGED / OJ0$$ / OJOSS Publicity*  
*Autor del sitio: JOSS DESXGN (Jo$$ publicity, Cúcuta, Colombia)*  
*Asistente técnico: Claude Code (Anthropic)*
