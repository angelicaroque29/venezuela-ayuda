# Alerta Sísmica Venezuela

Sitio web de emergencia para informar en vivo sobre la crisis sísmica en Venezuela. Optimizado para conexiones lentas, mobile-first y modo oscuro.

## Características

- **Banner de alertas en vivo** con animación de pulso
- **Dashboard de datos críticos** (víctimas, magnitudes, intervalo entre sismos)
- **Noticias filtradas** desde RSS de medios venezolanos
- **Guía de supervivencia** (alertas Android, mito de la puerta, kit de emergencia)
- **Reporte ciudadano** vía formulario web, Telegram y WhatsApp
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

## Procesamiento por lotes

```bash
# Ejecutar un lote manualmente
npm run batch

# Modo cron (cada hora)
npm run batch:watch
```

También puedes llamar `POST /api/batch` con header `Authorization: Bearer <BATCH_CRON_SECRET>`.

## Bot de Telegram

```bash
pip install python-telegram-bot
export TELEGRAM_BOT_TOKEN=...
export DATA_DIR=./data
python bot/telegram_bot.py
```

## Variables de entorno — cómo conseguirlas

Copia `.env.example` a `.env.local` y completa cada valor:

### `OPENAI_API_KEY` (análisis por lotes)

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Entra en **API keys** → **Create new secret key**
4. Copia la clave (empieza con `sk-...`) y pégala en `.env.local`
5. Necesitas saldo en tu cuenta OpenAI (cobran por uso; el modo lote usa pocos tokens)

Sin esta clave el sitio funciona en **modo demo** (no llama a OpenAI).

### `TELEGRAM_BOT_TOKEN` (bot de reportes)

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot`
3. Elige un nombre y un usuario (ej: `venezuela_sismo_bot`)
4. BotFather te dará un token como `123456789:ABCdefGHI...`
5. Pégalo en `.env.local` como `TELEGRAM_BOT_TOKEN`

### `NEXT_PUBLIC_TELEGRAM_BOT_LINK` (enlace público al bot)

1. Usa el usuario que creaste en BotFather
2. El enlace es: `https://t.me/TU_USUARIO_BOT`
3. Ejemplo: `https://t.me/venezuela_sismo_bot`

### `NEXT_PUBLIC_WHATSAPP_NUMBER` (reportes por WhatsApp)

1. Usa un número de teléfono con WhatsApp (puede ser de una brigada o línea de ayuda)
2. Escribe el número **con código de país, sin + ni espacios**
3. Ejemplo Venezuela: `584121234567` (58 = país, 412 = móvil)

### `BATCH_CRON_SECRET` (opcional)

Una contraseña cualquiera que tú inventes para proteger el endpoint de lotes. Ejemplo: `mi_clave_secreta_123`

## Arquitectura de costos

1. **Frontend**: validación JS con palabras clave → bloquea spam sin costo
2. **Almacenamiento**: reportes en `data/reports.json` sin llamar a IA
3. **Backend**: cada hora, todos los reportes se agrupan en **un solo prompt** a OpenAI
4. **Resultado**: panel de brigadistas actualizado con reportes legítimos y falsos marcados
