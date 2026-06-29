# Desplegar en Vercel

Guía paso a paso para publicar **Alerta Sísmica Venezuela** y distribuirlo.

## Requisitos previos

- Cuenta en [vercel.com](https://vercel.com) (gratis)
- Cuenta en [GitHub](https://github.com) (el código ya está en el repo)
- (Opcional) [OpenAI API key](https://platform.openai.com) para triaje IA real

---

## Paso 1 — Importar el proyecto en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new)
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `venezuela-ayuda`
4. Branch: `cursor/venezuela-earthquake-crisis-2b99` (o `main` si ya hiciste merge)
5. Framework: **Next.js** (detectado automáticamente)
6. **No cambies** el build command: `npm run build`

---

## Paso 2 — Base de datos GRATIS (Upstash Redis)

> **No uses** Vercel → Storage → KV si te pide pagar ($8/mes). Eso es el marketplace de pago.
>
> **Usa Upstash directo — plan Free $0/mes** (256 MB, 500.000 comandos/mes). La app ya lo soporta.

En producción los reportes **no pueden guardarse en archivos** (Vercel es serverless).

### Opción recomendada — Upstash gratis (5 min)

1. Entra a [console.upstash.com](https://console.upstash.com) y crea cuenta (gratis)
2. **Create Database** → Redis
3. Nombre: `venezuela-sismo`
4. Región: la más cercana (ej. `us-east-1`)
5. **Plan: Free** — debe decir **$0/month**
6. En la pestaña del database → **REST API** → copia:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

7. En **Vercel** → tu proyecto → **Settings** → **Environment Variables**, añade:

| Variable | Valor |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | `https://....upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `AX...` |

8. Aplica a **Production** (y Preview si quieres)
9. **Redeploy** el proyecto

Listo — los reportes se guardan sin pagar nada.

### ¿Por qué no Vercel Storage?

Vercel Storage → KV ahora enlaza planes de Upstash **de pago** desde $8/mes. El plan Free solo está disponible creando la base **directo en Upstash** y pegando las variables a mano.

---

## Paso 3 — Variables de entorno

En Vercel → **Settings** → **Environment Variables**, añade:

| Variable | Valor | Obligatorio |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | No (modo demo sin ella) |
| `CRON_SECRET` | Clave secreta — genera con `npm run generate-cron-secret` | Sí (cron gratis) |
| `UPSTASH_REDIS_REST_URL` | De Upstash console (plan Free) | Sí (reportes en producción) |
| `UPSTASH_REDIS_REST_TOKEN` | De Upstash console (plan Free) | Sí (reportes en producción) |
| `BATCH_CRON_SECRET` | Misma clave o otra | Opcional |

`CRON_SECRET` lo creas tú. Ver [CRON-GRATIS.md](./CRON-GRATIS.md).

---

## Paso 4 — Deploy

1. Clic **Deploy**
2. Espera 1–2 minutos
3. Tu URL será algo como: `https://venezuela-ayuda.vercel.app`

---

## Paso 5 — Cron automático (triaje cada hora) — GRATIS

> **Importante:** No hay `vercel.json` con crons — eso requiere Vercel Pro y rompe el deploy gratis.

Usa **GitHub Actions** (ya configurado). Guía: **[CRON-GRATIS.md](./CRON-GRATIS.md)**

Resumen rápido:

```bash
# 1. Genera tu clave
npm run generate-cron-secret

# 2. Pon CRON_SECRET en Vercel Environment Variables

# 3. En GitHub → Settings → Secrets → Actions:
#    CRON_SECRET = tu clave
#    DEPLOY_URL  = https://tu-proyecto.vercel.app
```

GitHub ejecutará `/api/cron/batch` cada hora automáticamente.

---

## Paso 6 — Dominio personalizado (opcional)

1. Vercel → **Settings** → **Domains**
2. Añade tu dominio (ej: `alertasismica.ve`)
3. Configura DNS según indique Vercel

---

## Compartir con la comunidad

Una vez desplegado, comparte:

- **URL principal** — información y reportes
- **/panel** — solo para brigadas / coordinadores
- **WhatsApp** — configura `NEXT_PUBLIC_WHATSAPP_NUMBER` con línea real de ayuda

### Mensaje sugerido para redes

> 🚨 Alerta Sísmica Venezuela — Información en vivo, guías de supervivencia y reportes ciudadanos.
> Reporta daños aquí: [TU-URL]
> Activa alertas de terremoto en tu Android o iPhone.

---

## Verificar que funciona en producción

1. Abre tu URL → debe cargar la página
2. Envía un reporte de prueba con ubicación y palabra "sismo"
3. Ve a `/panel` → debe aparecer como **Pendiente**
4. Ejecuta triaje (cron o curl manual)
5. Recarga `/panel` → debe moverse a **Triaje IA — confirmar**

---

## Local vs Producción

| Entorno | Almacenamiento |
|---------|----------------|
| Local (`npm run dev`) | Archivos en `data/*.json` |
| Vercel | Upstash Redis Free (`UPSTASH_REDIS_REST_*`) |

---

## Costos estimados

- **Vercel Hobby**: gratis
- **Upstash Redis Free**: gratis (256 MB, 500K comandos/mes — suficiente para emergencias)
- **Cron (GitHub Actions)**: gratis — ver [CRON-GRATIS.md](./CRON-GRATIS.md)
- **OpenAI**: ~$0.50–$4/mes según reportes (máx 1 llamada/hora) — opcional
- **Vercel Pro**: ~$20/mes — no necesario
