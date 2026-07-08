# AEGILON XDR Database Design (ERD) - Terbaru

Diagram Entity-Relationship (ERD) di bawah ini telah diperbarui untuk mencerminkan skema database terbaru Aegilon XDR.

## ERD (Entity-Relationship Diagram)

```mermaid
erDiagram
    USERS {
        uuid user_id PK
        string username UK
        string email UK
        string password_hash
        string role "Enum: admin, analyst"
        boolean is_active
        timestamp created_at
    }

    SECURITY_EVENTS {
        uuid event_id PK
        timestamp timestamp
        string layer "Enum: host, network, application"
        string source "Enum: osquery, wazuh, backend"
        string event_type
        string host
        string host_ip
        string severity "Nullable"
        text raw_log
    }

    ALERTS {
        uuid alert_id PK
        uuid event_id FK
        uuid incident_id FK "Nullable"
        string title
        string layer
        string detection_name
        int risk_score
        string severity "Enum: Low, Medium, High, Critical"
        string status "Enum: open, investigating, resolved"
        string mitre_id "Nullable"
        timestamp created_at
    }

    INCIDENTS {
        uuid incident_id PK
        string title
        string severity "Enum: High, Critical"
        string status "Enum: open, contained, closed"
        timestamp created_at
    }

    REMEDIATIONS {
        uuid remediation_id PK
        uuid incident_id FK
        string action "Enum: block_ip, isolate_container"
        string target
        string severity "Enum: High, Critical"
        timestamp requested_at
        string status "Enum: pending, success, failed"
        timestamp executed_at "Nullable"
        int duration_ms "Nullable"
        text detail "Nullable"
    }

    SECURITY_EVENTS ||--o| ALERTS : "Triggers"
    INCIDENTS ||--o{ ALERTS : "Groups"
    INCIDENTS ||--o{ REMEDIATIONS : "Has Response Actions"
```

---

## Penjelasan Tabel & Relasi (Terbaru)

1. **USERS (`users`)**
   - **Fungsi:** Menyimpan data kredensial pengguna dashboard.
   - **Kolom Kunci:** `user_id` (UUID, Primary Key).
   - **Penjelasan:** Role berbasis RBAC hanya ada `admin` dan `analyst`. Kolom `password_hash` diamankan menggunakan bcrypt.

2. **SECURITY_EVENTS (`security_events`)**
   - **Fungsi:** Menyimpan data mentah dari telemetri Wazuh/Osquery yang telah dinormalisasi.
   - **Kolom Kunci:** `event_id` (UUID, Primary Key).
   - **Kolom Baru:** **`severity`** (String, Nullable) ditambahkan agar Backend dapat mencatat langsung tingkat keparahan awal dari log telemetri Wazuh/Osquery sebelum dianalisis oleh Detection Engine.
   - **Penjelasan:** Payload asli disimpan di kolom `raw_log` (Tipe Teks) untuk forensik.

3. **ALERTS (`alerts`)**
   - **Fungsi:** Menyimpan hasil deteksi anomali (*Detection Result*) dari Python Detection Engine. 
   - **Kolom Kunci:** `alert_id` (UUID, Primary Key).
   - **Kolom Baru:** **`mitre_id`** (String, Nullable) ditambahkan untuk menyimpan pemetaan taktik/teknik serangan berdasarkan framework MITRE ATT&CK (contoh: `T1046`, `T1059`).
   - **Relasi:** Terhubung ke `security_events` (1:1/0) dan `incidents` (N:1, Nullable).

4. **INCIDENTS (`incidents`)**
   - **Fungsi:** Wadah untuk mengkorelasikan beberapa Alert berstatus High/Critical menjadi satu insiden keamanan yang dapat diinvestigasi.
   - **Kolom Kunci:** `incident_id` (UUID, Primary Key).

5. **REMEDIATIONS (`remediations`)**
   - **Fungsi:** Menyimpan *Response History* dari modul OpenClaw (Module 5) seperti pemblokiran IP atau isolasi *container*.
   - **Kolom Kunci:** `remediation_id` (UUID, Primary Key).
   - **Relasi:** Terhubung ke `incidents` (N:1) untuk mencatat aksi mitigasi otomatis yang telah dijalankan.
