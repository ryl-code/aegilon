import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("aegilon-telegram-service")

class TelegramService:
    @staticmethod
    async def send_incident_alert(
        incident_number: str,
        title: str,
        severity: str,
        host_name: str,
        risk_score: float,
        category: str = "Execution"
    ) -> bool:
        token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID

        if not token or not chat_id:
            logger.info("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.")
            return False

        icon = "🔴" if severity.lower() == "critical" else "🟠" if severity.lower() == "high" else "🟡"

        message_text = (
            f"{icon} <b>AEGILON XDR ALERT NOTIFICATION</b>\n\n"
            f"<b>Incident:</b> <code>{incident_number}</code>\n"
            f"<b>Title:</b> {title}\n"
            f"<b>Severity:</b> {severity}\n"
            f"<b>Host:</b> <code>{host_name}</code>\n"
            f"<b>Risk Score:</b> {risk_score:.1f} / 100\n"
            f"<b>Category:</b> {category}\n\n"
            f"🔗 <a href='{settings.FRONTEND_URL}/incidents'>Open Dashboard to Investigate</a>"
        )

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message_text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }

        try:
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    logger.info(f"Successfully sent Telegram alert for Incident {incident_number}")
                    return True
                else:
                    logger.error(f"Failed to send Telegram alert: Status {resp.status_code} - {resp.text}")
                    return False
        except Exception as e:
            logger.error(f"Error sending Telegram alert: {str(e)}")
            return False

telegram_service = TelegramService()
