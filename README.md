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

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | API key para análisis por lotes (opcional en demo) |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `BATCH_CRON_SECRET` | Protege el endpoint de lotes |
| `NEXT_PUBLIC_TELEGRAM_BOT_LINK` | Enlace al bot |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp para reportes |

## Arquitectura de costos

1. **Frontend**: validación JS con palabras clave → bloquea spam sin costo
2. **Almacenamiento**: reportes en `data/reports.json` sin llamar a IA
3. **Backend**: cada hora, todos los reportes se agrupan en **un solo prompt** a OpenAI
4. **Resultado**: panel de brigadistas actualizado con reportes legítimos y falsos marcados
