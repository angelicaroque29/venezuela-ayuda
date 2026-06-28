# Bot de Telegram — DESACTIVADO

Este bot está desactivado por ahora. No es necesario para usar el sitio.

## ¿Para qué servía?

Era una forma alternativa de enviar reportes ciudadanos por chat de Telegram.
Los mensajes se guardaban igual que el formulario web y se procesaban por lotes con IA.

## Alternativas activas

- **Formulario web** en la página principal
- **WhatsApp** (botón verde en el formulario de reporte)

## Si quieres reactivarlo en el futuro

```bash
pip install python-telegram-bot
export TELEGRAM_BOT_TOKEN=tu_token
export DATA_DIR=./data
python bot/telegram_bot.py
```

Y configura `NEXT_PUBLIC_TELEGRAM_BOT_LINK` en `.env.local`.
