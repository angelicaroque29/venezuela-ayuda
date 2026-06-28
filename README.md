# Alerta Sísmica Venezuela

Sitio web de emergencia para informar en vivo sobre la crisis sísmica en Venezuela. Optimizado para conexiones lentas, mobile-first y modo oscuro.

## Características

- **Banner de alertas en vivo** con animación de pulso
- **Dashboard de datos críticos** (víctimas, magnitudes, intervalo entre sismos)
- **Noticias filtradas** desde RSS de medios venezolanos
- **Guía de supervivencia** (alertas Android, mito de la puerta, kit de emergencia)
- **Reporte ciudadano** vía formulario web y WhatsApp
- **Validación local** en frontend (bloquea spam antes de guardar)
- **Procesamiento IA por lotes** cada hora (1 sola llamada OpenAI por lote)
- **Panel de brigadistas** en `/panel`

## Inicio rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Desplegar en Vercel (producción)

Guía completa en **[DEPLOY.md](./DEPLOY.md)** — incluye Vercel KV, variables de entorno, cron y dominio.

Resumen rápido:
1. Importa el repo en [vercel.com/new](https://vercel.com/new)
2. Crea **Vercel KV** en Storage y conéctalo al proyecto
3. Añade `OPENAI_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. Deploy → comparte la URL

## ¿Cómo verifica la IA? ¿Es cierto?

**No es verdad confirmada — es triaje.**

| Capa | Qué hace |
|------|----------|
| Filtro local | Bloquea spam antes de guardar |
| Triaje IA (hora) | Detecta bots, pánico infundado, incoherencias |
| Brigadas | **Deben confirmar en terreno** antes de actuar |

Un reporte "aprobado" por IA significa que *parece genuino*, no que el hecho sea cierto.
Cruza siempre con Defensa Civil, FUNVISIS y medios oficiales.

## Procesamiento por lotes (solo servidor)

La IA **no se puede ejecutar desde la web** ni desde el panel de brigadas. Solo corre en el servidor:

```bash
# Ejecutar un lote manualmente (administrador del servidor)
npm run batch

# Modo cron automático cada hora
npm run batch:watch
```

Para cron HTTP externo (opcional), configura `BATCH_CRON_SECRET` y llama:
`POST /api/batch` con header `Authorization: Bearer <BATCH_CRON_SECRET>`

## Bot de Telegram — desactivado

El bot de Telegram está desactivado. Usa el formulario web o WhatsApp.
Ver `bot/README.md` si quieres reactivarlo en el futuro.

## Variables de entorno — cómo conseguirlas

Copia `.env.example` a `.env.local` y completa cada valor:

### `OPENAI_API_KEY` (análisis por lotes)

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Entra en **API keys** → **Create new secret key**
4. Copia la clave (empieza con `sk-...`) y pégala en `.env.local`
5. Necesitas saldo en tu cuenta OpenAI (cobran por uso; el modo lote usa pocos tokens)

Sin esta clave el sitio funciona en **modo demo** (no llama a OpenAI).

### `NEXT_PUBLIC_WHATSAPP_NUMBER` (reportes por WhatsApp)

1. Usa un número de teléfono con WhatsApp (puede ser de una brigada o línea de ayuda)
2. Escribe el número **con código de país, sin + ni espacios**
3. Ejemplo Venezuela: `584121234567` (58 = país, 412 = móvil)

### `BATCH_CRON_SECRET` (opcional)

Una contraseña cualquiera que tú inventes para proteger el endpoint de lotes. Ejemplo: `mi_clave_secreta_123`

## Arquitectura de costos

1. **Frontend**: validación JS con palabras clave → bloquea spam sin costo
2. **Almacenamiento**: reportes en Vercel KV (producción) o `data/*.json` (local)
3. **Backend**: cada hora, todos los reportes se agrupan en **un solo prompt** a OpenAI
4. **Resultado**: panel de brigadistas actualizado con reportes legítimos y falsos marcados
