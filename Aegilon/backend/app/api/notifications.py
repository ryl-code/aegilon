from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("telegram_notifier")

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class TelegramNotificationPayload(BaseModel):
    incident_id: str
    severity: str
    risk_score: float
    title: str
    host: str
    recommendation: str

@router.post("/telegram")
async def send_telegram_alert(payload: TelegramNotificationPayload):
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not bot_token or not chat_id:
        logger.warning("Telegram token atau chat ID belum dikonfigurasi.")
        return {"status": "skipped", "reason": "No credentials configured"}

    n8n_url = getattr(settings, "N8N_WEBHOOK_URL", None)
    if n8n_url:
        n8n_data = payload.model_dump()
        n8n_data["bot_token"] = bot_token
        n8n_data["chat_id"] = chat_id
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                n8n_resp = await client.post(n8n_url, json=n8n_data)
                if n8n_resp.status_code in [200, 201]:
                    logger.info("Notifikasi berhasil diteruskan via n8n webhook.")
                    return {"status": "success", "message": "Notification sent via n8n webhook"}
        except Exception as e:
            logger.warning(f"Gagal mengirim via n8n: {str(e)}. Menggunakan koneksi Telegram langsung.")

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    from datetime import datetime
    from zoneinfo import ZoneInfo
    now_wib = datetime.now(ZoneInfo("Asia/Jakarta")).strftime("%Y-%m-%d %H:%M:%S WIB")

    message = (
        f"🚨 <b>AEGILON XDR ALERT DETECTED!</b> 🚨\n\n"
        f"<b>Incident:</b> {payload.title}\n"
        f"<b>Severity:</b> {payload.severity}\n"
        f"<b>Risk Score:</b> {payload.risk_score}/100\n"
        f"<b>Host Target:</b> {payload.host}\n"
        f"<b>Recommendation:</b> {payload.recommendation}\n"
        f"<b>Timestamp:</b> {now_wib}\n\n"
        f"<i>Status: Remediation triggered.</i>"
    )

    telegram_payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=telegram_payload)
            if response.status_code == 200:
                logger.info("Notifikasi Telegram berhasil terkirim.")
                return {"status": "success", "message": "Notification sent successfully"}
            else:
                logger.error(f"Gagal kirim Telegram: {response.text}")
                raise HTTPException(status_code=400, detail=f"Failed to send telegram message: {response.text}")
        except Exception as e:
            logger.error(f"Error mengirim Telegram notification: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error sending telegram message: {str(e)}")
