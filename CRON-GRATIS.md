# Cron gratis + CRON_SECRET

## ¿Qué es CRON_SECRET?

Es una **contraseña secreta** que protege el endpoint `/api/cron/batch`.  
Sin ella, nadie puede ejecutar el triaje IA desde internet.

---

## Paso 1 — Crear tu CRON_SECRET

Elige **una** opción:

### Opción A — Script del proyecto (recomendado)

```bash
npm run generate-cron-secret
```

Copia el texto que aparece (64 caracteres hex).

### Opción B — Terminal

```bash
openssl rand -hex 32
```

### Opción C — Inventa una frase larga

Ejemplo (usa la tuya, no esta):
```
venezuela-sismo-2026-mi-clave-super-secreta-xK9mP2
```

Mínimo 32 caracteres, difícil de adivinar.

---

## Paso 2 — Guardarlo en Vercel

1. [vercel.com](https://vercel.com) → tu proyecto
2. **Settings** → **Environment Variables**
3. Añade:

| Name | Value |
|------|-------|
| `CRON_SECRET` | (pega tu clave) |
| `BATCH_CRON_SECRET` | (la misma clave, opcional) |

4. **Redeploy** el proyecto para que tome efecto

---

## Paso 3 — Cron GRATIS (elige una opción)

### ⭐ Opción A — GitHub Actions (recomendada, 100% gratis)

Ya está configurado en `.github/workflows/hourly-batch.yml`.

> **Nota:** No usamos cron de Vercel (requiere Pro ~$20/mes). El archivo `vercel.json` con crons fue eliminado para que el deploy en plan Hobby funcione.

1. Despliega primero en Vercel y copia tu URL  
   Ej: `https://venezuela-ayuda.vercel.app`

2. En GitHub → repo `venezuela-ayuda` → **Settings** → **Secrets and variables** → **Actions**

3. Clic **New repository secret** y crea:

| Secret name | Value |
|-------------|-------|
| `CRON_SECRET` | La misma clave que pusiste en Vercel |
| `DEPLOY_URL` | Tu URL sin barra final. Ej: `https://venezuela-ayuda.vercel.app` |

4. Listo. GitHub ejecutará el triaje **cada hora gratis** llamando a `POST /api/batch`.

> **Si ves error 404:** tu Vercel tiene código viejo. Ve a Vercel → **Deployments** → **Redeploy** (rama `main`).

**Probar manualmente:** GitHub → **Actions** → **Hourly IA Batch** → **Run workflow**

---

### Opción B — cron-job.org (gratis, sin GitHub)

1. Crea cuenta en [cron-job.org](https://cron-job.org) (gratis)
2. **Create cronjob**:
   - **URL:** `https://TU-DOMINIO.vercel.app/api/cron/batch`
   - **Schedule:** Every 1 hour
   - **Request method:** GET
   - **Headers:**  
     `Authorization` = `Bearer TU_CRON_SECRET`
3. Guardar

---

### Opción C — Vercel Cron (NO usar en plan gratis)

~~Requiere Vercel Pro (~$20/mes).~~ **Eliminado del proyecto** — causaba fallos de deploy en Hobby.

Usa GitHub Actions (Opción A) en su lugar.

---

### Opción D — Tu computadora (solo pruebas)

```bash
npm run batch:watch
```

Deja la terminal abierta. No sirve para producción 24/7.

---

## Paso 4 — Verificar que funciona

```bash
curl -s -X POST "https://TU-DOMINIO.vercel.app/api/batch" \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

Respuestas esperadas:

| Respuesta | Significado |
|-----------|-------------|
| `{"ok":true,"processed":0,"usedOpenAI":false,...}` | OK, sin reportes pendientes |
| `{"ok":true,"processed":3,"usedOpenAI":true,...}` | OK, triaje ejecutado |
| `{"error":"No autorizado"}` | CRON_SECRET incorrecto |
| `{"ok":false,"message":"Rate limit..."}` | Ya se usó OpenAI esta hora (normal) |

---

## Resumen de costos

| Servicio | Costo |
|----------|-------|
| Vercel Hobby (hosting) | **Gratis** |
| GitHub Actions (cron) | **Gratis** |
| cron-job.org | **Gratis** |
| Vercel KV (reportes) | **Gratis** (tier generoso) |
| OpenAI triaje | **~$0.50–$4/mes** según reportes |
| Vercel Pro (cron nativo) | ~$20/mes — **no necesario** |

**Recomendación:** Vercel Hobby + GitHub Actions + CRON_SECRET = **$0 en hosting y cron**.
