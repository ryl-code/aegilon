# 🚀 Setup Notifikasi Telegram dengan n8n

Panduan lengkap untuk mengintegrasikan notifikasi Telegram menggunakan **n8n** (Automated Workflow).

---

## 📁 File yang Tersedia

1. **`telegram_notification_workflow.json`**: Template workflow n8n yang siap di-import.
2. **`docker-compose.n8n.yml`**: Berkas Docker Compose untuk menjalankan n8n di komputer/server lokal.

---

## 🛠️ Langkah 1: Persiapan Bot Telegram & Chat ID

1. **Buat Bot Telegram**:
   - Buka Telegram dan cari **[@BotFather](https://t.me/BotFather)**.
   - Kirim perintah `/newbot`, beri nama dan username untuk bot Anda.
   - Simpan **HTTP API Token** (contoh: `7123456789:AAFx...`).

2. **Dapatkan Chat ID (Tujuan Notifikasi)**:
   - Cari bot **[@userinfobot](https://t.me/userinfobot)** di Telegram dan kirim pesan `/start`.
   - Simpan **Id** Anda (contoh: `123456789`).
   - *Jika ingin dikirim ke Grup*: Tambahkan bot Anda ke grup, lalu gunakan [@myidbot](https://t.me/myidbot) untuk mendapatkan Group Chat ID (biasanya diawali minus `-100...`).

---

## 🐳 Langkah 2: Jalankan n8n (Opsi Docker)

Jika Anda belum memiliki instance n8n, Anda bisa menjalankannya via Docker:

```bash
docker-compose -f n8n/docker-compose.n8n.yml up -d
```

Buka browser dan akses **`http://localhost:5678`**.

---

## 📥 Langkah 3: Import Workflow ke n8n

1. Buka dashboard **n8n** (`http://localhost:5678`).
2. Buat Workflow baru (`+ Add Workflow`).
3. Klik menu titik tiga **`...`** di pojok kanan atas -> pilih **`Import from File`**.
4. Pilih file **`n8n/telegram_notification_workflow.json`**.
5. Klik **`Save`** dan aktifkan toggle **`Active`** di pojok kanan atas.

---

## 🧪 Langkah 4: Uji Coba Webhook Notification

Gunakan command `curl` di terminal / Command Prompt untuk menguji pengiriman notifikasi:

```bash
curl -X POST http://localhost:5678/webhook/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "bot_token": "8896459477:AAECPoVHIqELcWQci65ra4ML0GCH4KjhubU",
    "chat_id": "YOUR_TELEGRAM_CHAT_ID",
    "title": "Aegilon Detection Test",
    "severity": "CRITICAL",
    "risk_score": 95.5,
    "host": "server-prod-01",
    "incident_id": "INC-2026-001",
    "recommendation": "Isolate host and revoke access tokens immediately"
  }'
```

*Catatan: Jika `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sudah diset di environment variables n8n, Anda cukup mengirim payload tanpa dua field tersebut.*

---

## 🔗 Integrasi Aegilon / Backend Service

Untuk mengirim alert dari Aegilon Backend ke n8n:
Point endpoint webhook Aegilon ke: `http://localhost:5678/webhook/telegram-notify` (atau URL n8n public/ngrok Anda).
