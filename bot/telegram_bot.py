"""
Bot de Asistencia ante Sismos - Venezuela
Estrategia híbrida: almacena reportes localmente, procesamiento IA por lotes cada hora.
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
REPORTS_FILE = DATA_DIR / "reports.json"

EARTHQUAKE_KEYWORDS = [
    "sismo", "temblor", "réplica", "replica", "terremoto", "colapso", "derrumbe",
    "ayuda", "heridos", "herido", "víctimas", "victimas", "daño", "daños",
    "emergencia", "rescate", "caracas", "la guaira", "guaira", "miranda",
    "venezuela", "magnitud", "hospital", "agua", "alimentos", "refugio",
    "estructural", "grieta", "edificio", "bomberos", "reporte", "ubicación",
    "ubicacion",
]


def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def validate_report_locally(text: str) -> tuple[bool, str | None]:
    trimmed = text.strip()
    if len(trimmed) < 15:
        return False, "El reporte es demasiado corto. Describe ubicación y situación."
    lower = trimmed.lower()
    if not any(kw in lower for kw in EARTHQUAKE_KEYWORDS):
        return False, (
            "Tu mensaje no parece relacionado con la emergencia sísmica. "
            "Incluye ubicación y tipo de daño o necesidad."
        )
    return True, None


def load_reports() -> list:
    ensure_data_dir()
    if not REPORTS_FILE.exists():
        return []
    try:
        return json.loads(REPORTS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def save_report(text: str) -> dict:
    reports = load_reports()
    report = {
        "id": f"rpt_{int(datetime.now(timezone.utc).timestamp() * 1000)}_tg",
        "text": text.strip(),
        "source": "telegram",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "processed": False,
    }
    reports.append(report)
    REPORTS_FILE.write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding="utf-8")
    return report


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    bienvenida = (
        "🚨 *Bot de Asistencia ante Sismos - Venezuela* 🚨\n\n"
        "Este canal recibe reportes de daños y necesidades.\n"
        "La IA los verifica *cada hora en lote* para reducir costos y filtrar desinformación.\n\n"
        "📢 *RECOMENDACIÓN VITAL:*\n"
        "Activa las *Alertas de Terremotos* en tu Android:\n"
        "1. Ajustes → Seguridad y emergencia\n"
        "2. Activa 'Alertas de terremotos'\n\n"
        "Escribe tu reporte con: *Ubicación, tipo de daño o insumo necesitado.*"
    )
    await update.message.reply_text(bienvenida, parse_mode="Markdown")


async def procesar_reporte(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_text = update.message.text or ""

    valid, reason = validate_report_locally(user_text)
    if not valid:
        await update.message.reply_text(f"⚠️ {reason}")
        return

    report = save_report(user_text)

    await update.message.reply_text(
        "✅ Reporte recibido y guardado.\n\n"
        "Será analizado en el próximo lote horario junto con otros reportes "
        "para detectar desinformación y priorizar ayuda.\n\n"
        f"ID: `{report['id']}`",
        parse_mode="Markdown",
    )


def main():
    if not TELEGRAM_BOT_TOKEN:
        raise SystemExit("TELEGRAM_BOT_TOKEN no configurado.")

    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, procesar_reporte))

    print("Bot de asistencia sísmica corriendo (modo lote horario)...")
    application.run_polling()


if __name__ == "__main__":
    main()
