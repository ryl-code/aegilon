<p align="center">
  <img src="Agilon logo.png" alt="AEGILON Logo" width="480" />
</p>

# 🛡️ AEGILON: Low-Overhead Extended Detection & Response (XDR) Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📝 Deskripsi Proyek (Project Description)

### Apa Itu AEGILON?
**AEGILON** adalah platform **Extended Detection and Response (XDR)** modern berbasis arsitektur *Low-Overhead* dan *Single Source of Truth*. Platform ini dirancang khusus untuk mengumpulkan telemetri dari host/endpoint Windows (menggunakan Wazuh & Osquery), mendeteksi ancaman siber secara otomatis melalui analisis perilaku (*behaviour-based*) dan algoritma *Machine Learning*, mengelola siklus hidup insiden (*incident lifecycle*) secara terstruktur, hingga melakukan tindakan respons otomatis (*SOAR*).

### Masalah yang Diselesaikan
1. **Resource Overhead Tinggi**: Platform SIEM/EDR tradisional membutuhkan konsumsi daya komputasi (CPU/RAM) yang besar. AEGILON dirancang sangat efisien (*low-overhead*) dengan arsitektur berkinerja tinggi.
2. **Alert Fatigue & Duplikasi Insiden**: Tim SOC sering kewalahan menangani ribuan alert berulang. AEGILON menyelesaikan masalah ini melalui mekanisme **Smart Duplicate Prevention (`occurrence++`)**, di mana alert baru dengan pola ancaman yang sama pada host aktif dikonsolidasikan ke insiden yang sedang terbuka alih-alih membuat insiden duplikat.
3. **Analisis Terpisah & Penanganan Lambat**: Mengintegrasikan alur ingest telemetri, deteksi ancaman, skoring risiko, perangkaian bukti (*evidence collection*), audit logging, hingga notifikasi respons otomatis dalam satu sistem terpadu.

### Mengapa Memilih AEGILON?
- ⚡ **Low-Overhead Architecture**: Memanfaatkan FastAPI & PostgreSQL (Supabase) asynchronous untuk efisiensi eksekusi tinggi.
- 🎯 **Smart Deduplication & Evidence Management**: Menghilangkan *noise* alert dan mengelompokkan bukti-bukti serangan (*evidence*) secara otomatis.
- 🤖 **End-to-End SOAR Integration**: Respon otomatis berbasis skenario dengan integrasi alur kerja n8n dan notifikasi instan ke Telegram analis.
- 📊 **Dynamic Risk Scoring**: Penilaian tingkat risiko (*severity level*) secara otomatis berbasis dampak ancaman dan kritisitas aset.
- 🕒 **Full WIB Timezone Normalization**: Semua pencatatan timestamp telemetri, alert, log audit, dan ID insiden disesuaikan secara presisi ke Waktu Indonesia Barat (`Asia/Jakarta`, WIB).

---

## 📌 Daftar Isi (Table of Contents)

- [🛡️ AEGILON: Low-Overhead Extended Detection \& Response (XDR) Platform](#️-aegilon-low-overhead-extended-detection--response-xdr-platform)
  - [📝 Deskripsi Proyek (Project Description)](#-deskripsi-proyek-project-description)
  - [📌 Daftar Isi (Table of Contents)](#-daftar-isi-table-of-contents)
  - [🏛️ Arsitektur Platform (Platform Architecture)](#️-arsitektur-platform-platform-architecture)
  - [✨ Fitur-Fitur Utama (Features Breakdown)](#-fitur-fitur-utama-features-breakdown)
  - [📋 Prasyarat (Prerequisites)](#-prasyarat-prerequisites)
  - [🚀 Panduan Instalasi (Installation)](#-panduan-instalasi-installation)
  - [💡 Cara Penggunaan (Usage)](#-cara-penggunaan-usage)
  - [📖 Dokumentasi API (API Reference)](#-dokumentasi-api-api-reference)
  - [🗺️ Roadmap (Peta Jalan)](#️-roadmap-peta-jalan)
  - [🤝 Panduan Berkontribusi (Contributing)](#-panduan-berkontribusi-contributing)
  - [🧪 Pengujian (Tests)](#-pengujian-tests)
  - [📄 Lisensi (License)](#-lisensi-license)
  - [📞 Kontak (Contact)](#-kontak-contact)

---

## 🏛️ Arsitektur Platform (Platform Architecture)

```text
               Windows Endpoint (Osquery + Wazuh Agent)
                                   │
                                   ▼
                          Wazuh Manager (SIEM)
                                   │
                                   ▼
          FastAPI Backend API (Orchestrator) ◄───► PostgreSQL (Supabase DB)
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
Detection Engine              Risk Engine              Automation Engine
(ML / Rule-based)          (Severity Assessment)        (SOAR & Telegram)
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   ▼
                      Next.js Analyst Dashboard (UI)
```

---

## ✨ Fitur-Fitur Utama (Features Breakdown)

Fitur-fitur utama AEGILON dikelompokkan secara mendalam berdasarkan komponen pembentuknya:

### 1. 🛡️ Telemetry Ingestion & Wazuh SIEM Integration
* **Automated Sync Background Loop**: FastAPI backend secara kontinu mengambil data alert dari Wazuh API setiap 5 detik secara asynchronous non-blocking.
* **Host Telemetry Auto-Discovery**: Menginventarisasi dan mendaftarkan endpoint/host Windows baru secara otomatis ke database begitu alert pertama terdeteksi.
* **WIB Timezone Normalization**: Mengonversi waktu UTC dari Wazuh & database ke standar Waktu Indonesia Barat (`Asia/Jakarta`).

### 2. ⚡ Behaviour-Based & ML Detection Engine
* **Dynamic Database Rules**: Aturan deteksi dibaca secara terpusat langsung dari Supabase database setiap 10 detik tanpa perlu melakukan restart server backend.
* **Cross-Layer Log Parser**: Mengonversi dan menganalisis raw logs telemetri (seperti eksekusi perintah CMD/PowerShell, koneksi jaringan, manipulasi registry, login berulang, dll.).
* **Machine Learning Anomaly Detection**: Didukung algoritma Machine Learning (*Isolation Forest* / *Scikit-Learn*) untuk mendeteksi perilaku abnormal tak terstruktur (*zero-day anomaly*).
* **Manual Run Trigger**: Endpoint `POST /detection/run` yang memungkinkan analis memicu analisis deteksi secara instan.

### 3. 📊 Dynamic Risk Engine
* **Contextual Risk Assessment**: Menghitung bobot risiko insiden secara otomatis berdasarkan tingkat kritisitas aset, dampak teknik serangan (MITRE ATT&CK), dan frekuensi kejadian.
* **Severity Classification**: Mengelompokkan ancaman ke dalam tingkatan keparahan: `Low`, `Medium`, `High`, dan `Critical`.

### 4. 📝 Advanced Incident Management & Lifecycle
* **Dynamic Sequence Numbering (WIB)**: Format penomoran insiden terurut otomatis: `INC-YYYYMMDD-XXXX` berbasis tanggal Waktu Indonesia Barat.
* **Smart Duplicate Prevention (`occurrence++`)**: Jika terjadi alert berulang pada host dan rule yang sama sebelum insiden di-*Closed*, AEGILON secara otomatis menambah hit counter `occurrence` dan menambahkan bukti alert baru tanpa menduplikasi baris insiden.
* **Evidence Management**: Tabel relasi `incident_alerts` mencatat seluruh alert pemicu sebagai barang bukti digital insiden.
* **Audit Trail Lifecycle History**: Tabel `incident_history` mencatat kronologi transisi status insiden (`Open -> Investigating -> Contained -> Resolved -> Closed`) beserta analis yang menanganinya.

### 5. 🤖 SOAR & Automation Engine
* **Automated Playbook Execution**: Memicu instruksi mitigasi otomatis (seperti isolasi host atau pemblokiran sesi).
* **Telegram Instant Notification**: Mengirim notifikasi ancaman berisiko tinggi secara *real-time* ke Telegram analis SOC.
* **n8n Workflow Integration**: Dukungan integrasi webhook ke n8n untuk otomatisasi alur kerja keamanan yang lebih kompleks.

### 6. 🗃️ Enterprise Audit Logging
* **SOC Analyst Activity Tracking**: Mencatat semua tindakan penting analis SOC (login, update status insiden, penugasan, hingga eksekusi aksi respons) ke tabel `audit_logs` beserta IP address client.
* **Audit Log Monitoring API**: Endpoint terproteksi `GET /audit-logs` untuk keperluan visibilitas dan kepatuhan audit.

### 7. 🖥️ Next.js Analyst Dashboard UI
* **SOC Overview Metrics**: Menampilkan widget metrik insiden aktif, distribusi severity, serta status host.
* **Interactive Incident Triage**: Tampilan antarmuka terperinci untuk investigasi insiden, timeline riwayat, daftar bukti alert, dan panel respons.
* **Host & Alert Inventory**: Tabel manajemen host terdaftar dan histori alert telemetri mentah.

---

## 📋 Prasyarat (Prerequisites)

Sebelum menjalankan AEGILON, pastikan lingkungan lokal Anda memenuhi prasyarat berikut:

| Software | Versi Minimum | Keterangan |
|---|---|---|
| **Docker & Docker Compose** | Docker v20.10+ / Compose v2.0+ | Untuk kompilasi & eksekusi container microservices |
| **Node.js** | v18.0.0+ | Jika ingin menjalankan frontend secara terpisah |
| **Python** | v3.10+ | Jika ingin menjalankan script/backend secara lokal |
| **PostgreSQL / Supabase** | v14+ | Database utama penyimpan data telemetri, alert, & insiden |
| **Wazuh Manager** | v4.x | SIEM Manager untuk pengumpulan telemetri agent endpoint |

---

## 🚀 Panduan Instalasi (Installation)

### Langkah 1: Clone Repository
```bash
git clone https://github.com/ryl-code/aegilon.git
cd aegilon
```

### Langkah 2: Konfigurasi Environment Variables
Buat file `.env` dari template `.env.example`:
```bash
cp .env.example .env
```

Isi variabel di dalam file `.env` sesuai kredensial lingkungan Anda:
```env
# Database & Authentication Configuration
DATABASE_URL=postgresql://postgres.eyoykqofbsrabctwfotr:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=supersecretjwtkeyforsecurityvalidation
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Wazuh SIEM Integration
WAZUH_API_URL=https://wazuh.manager:55000
WAZUH_USER=admin
WAZUH_PASSWORD=YOUR_WAZUH_PASSWORD

# Telegram SOAR Bot
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
```

### Langkah 3: Build & Jalankan Container
Jalankan seluruh layanan microservices AEGILON menggunakan Docker Compose:

```bash
docker compose up --build -d
```

Periksa apakah seluruh container berjalan dengan baik:
```bash
docker compose ps
```

### Langkah 4: Inisialisasi Detection Rules
Jalankan script seeder untuk memasukkan 20 core rules deteksi bawaan AEGILON ke database:
```bash
docker compose exec backend python /app/seed_detection_rules.py
```

---

## 💡 Cara Penggunaan (Usage)

### 1. Mengakses SOC Analyst Dashboard
Buka peramban web dan navigasikan ke alamat berikut:
- **URL Dashboard**: `http://localhost:3002`
- **Tampilan UI**: Dashboard menyediakan ringkasan insiden, pemantauan status host, serta manajemen alert.

### 2. Alur Kerja Investigasi Insiden (Triage Workflow)
1. Akses menu **Incidents** pada Dashboard.
2. Pilih insiden aktif dengan format kode `INC-YYYYMMDD-XXXX`.
3. Periksa panel **Evidence Alerts** untuk melihat log bukti pemicu serangan.
4. Perbarui status insiden (`Open` ➡️ `Investigating` ➡️ `Contained` ➡️ `Resolved` ➡️ `Closed`). Setiap perubahan akan dicatat secara otomatis ke audit trail.

---

## 📖 Dokumentasi API (API Reference)

AEGILON Backend menyediakan antarmuka dokumentasi Swagger UI interaktif yang dapat diakses di **`http://localhost:8080/docs`**.

### Daftar Ringkas Endpoints Utama

| Kategori | Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|---|
| **Authentication** | `POST` | `/auth/login` | Login pengguna untuk mendapatkan JWT Access Token | ❌ No |
| | `GET` | `/auth/me` | Mengambil detail profil pengguna yang terautentikasi | ✅ Yes |
| **Health Check** | `GET` | `/health` | Memeriksa status kesehatan server backend & database | ❌ No |
| **Hosts** | `GET` | `/hosts` | Menampilkan daftar seluruh endpoint host terdaftar | ✅ Yes |
| | `GET` | `/hosts/{id}` | Menampilkan detail telemetri host berdasarkan ID | ✅ Yes |
| **Alerts** | `GET` | `/alerts` | Menampilkan daftar alert telemetri (dengan paginasi) | ✅ Yes |
| | `GET` | `/alerts/unprocessed` | Menampilkan alert mentah baru berstatus `new` | ✅ Yes |
| **Incidents** | `GET` | `/incidents` | Menampilkan daftar insiden (filter severity/status) | ✅ Yes |
| | `GET` | `/incidents/stats` | Ringkasan statistik insiden untuk widget dashboard | ✅ Yes |
| | `GET` | `/incidents/{id}` | Menampilkan detail insiden terperinci | ✅ Yes |
| | `GET` | `/incidents/{id}/history` | Menampilkan audit trail transisi status insiden | ✅ Yes |
| | `GET` | `/incidents/{id}/alerts` | Menampilkan daftar bukti alert (*evidence*) insiden | ✅ Yes |
| | `POST` | `/incidents` | Membuat entri insiden baru secara manual | ✅ Yes |
| | `PATCH` | `/incidents/{id}/status` | Mengubah status siklus hidup insiden | ✅ Yes |
| **Detection** | `POST` | `/detection/run` | Memicu eksekusi engine deteksi backend secara instan | ✅ Yes |
| **Audit Logs** | `GET` | `/audit-logs` | Menampilkan log audit aktivitas analis SOC | ✅ Yes |

### Contoh Kode Snippet

**Pengujian Login via cURL:**
```bash
curl -X POST "http://localhost:8080/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@aegilon.com&password=YourPassword"
```

**Memicu Engine Deteksi via Python:**
```python
import requests

url = "http://localhost:8080/detection/run"
headers = {
    "Authorization": "Bearer YOUR_JWT_ACCESS_TOKEN"
}

response = requests.post(url, headers=headers)
print(response.json())
```

---

## 🗺️ Roadmap (Peta Jalan)

- [x] Integration with Wazuh SIEM & Osquery host telemetry.
- [x] Dynamic Database-driven Rule Engine & Cross-layer parsing.
- [x] Smart Incident Deduplication (`occurrence++`) & Evidence Tracking.
- [x] Enterprise Audit Logging & IP Tracing.
- [x] Next.js 14 SOC Analyst Dashboard UI.
- [x] SOAR Automation Playbooks & Telegram Instant Alert.
- [ ] **Fase 1**: Penambahan Model ML Anomaly Detection berbasis Autoencoder untuk mendeteksi *lateral movement*.
- [ ] **Fase 2**: Asisten AI SOC Copilot (LLM) untuk pembuatan ringkasan eksekutif insiden secara gratis/lokal.
- [ ] **Fase 3**: Dukungan parser otomatis untuk format YARA & Sigma Rules.
- [ ] **Fase 4**: Pengujian integrasi Multi-Tenancy & Custom Agent Cross-Platform (Linux & macOS).

---

## 🤝 Panduan Berkontribusi (Contributing)

Kami menyambut baik kontribusi dalam pengembangan AEGILON! Ikuti langkah-langkah berikut:

1. **Fork** repository ini.
2. Buat **Feature Branch** baru (`git checkout -b feature/FiturBaruAnda`).
3. Simpan perubahan Anda dengan commit yang jelas (`git commit -m 'Menambahkan FiturBaruAnda'`).
4. Push branch ke repository Anda (`git push origin feature/FiturBaruAnda`).
5. Buat **Pull Request (PR)** baru dan jelaskan fitur atau perbaikan yang Anda lakukan.

---

## 🧪 Pengujian (Tests)

AEGILON dilengkapi dengan skrip verifikasi dan unit test untuk menguji modul utama:

### Menjalankan Unit Tests di Lingkungan Docker
```bash
# Pengujian Manajemen Insiden & Smart Deduplication
docker compose run --entrypoint python backend /app/test_incident_management.py

# Pengujian Engine Deteksi & Log Parsing
docker compose run --entrypoint python backend /app/test_detection_engine.py
```

---

## 📄 Lisensi (License)

Proyek ini dilisensikan di bawah lisensi **MIT License**. Lihat file [LICENSE](LICENSE) untuk informasi lisensi secara rinci.

---

## 📞 Kontak (Contact)

- **Tim Pengembang**: AEGILON XDR Security Team
- **GitHub Repository**: [https://github.com/ryl-code/aegilon](https://github.com/ryl-code/aegilon)
- **Dokumentasi & Support**: `support@aegilon.sec`

---

<p align="center">
  <i>Developed with ❤️ for Advanced Cyber Threat Defense.</i>
</p>
