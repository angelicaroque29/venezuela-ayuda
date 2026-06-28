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

## Paso 2 — Crear base de datos (Vercel KV)

En producción los reportes **no pueden guardarse en archivos** (Vercel es serverless).

1. En el dashboard de Vercel → tu proyecto → **Storage**
2. Clic **Create Database** → **KV** (Redis)
3. Nombre: `venezuela-sismo-kv`
4. Conectar al proyecto

Vercel añade automáticamente:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

---

## Paso 3 — Variables de entorno

En Vercel → **Settings** → **Environment Variables**, añade:

| Variable | Valor | Obligatorio |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | No (modo demo sin ella) |
| `CRON_SECRET` | Clave secreta — genera con `npm run generate-cron-secret` | Sí (cron gratis) |
| `BATCH_CRON_SECRET` | Misma clave o otra | Opcional |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `58412...` | Recomendado |

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
| Vercel | Vercel KV (Redis) |

---

## Costos estimados

- **Vercel Hobby**: gratis
- **Cron (GitHub Actions o cron-job.org)**: gratis — ver [CRON-GRATIS.md](./CRON-GRATIS.md)
- **Vercel KV**: tier gratis generoso para emergencias
- **OpenAI**: ~$0.50–$4/mes según reportes (máx 1 llamada/hora)
- **Vercel Pro**: ~$20/mes — solo si quieres cron nativo (no necesario)
