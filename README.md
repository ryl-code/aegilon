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

## 📝 Project Description

### What is AEGILON?
**AEGILON** is a modern **Extended Detection and Response (XDR)** platform engineered with a *Low-Overhead* and *Single Source of Truth* architecture. It is specifically designed to ingest telemetry from Windows endpoints (using Wazuh & Osquery), detect cyber threats automatically via behavior-based rules and Machine Learning algorithms, manage the incident lifecycle, and execute automated response actions (SOAR).

### Key Problems Solved
1. **High Resource Overhead**: Traditional SIEM/EDR solutions consume heavy CPU and RAM. AEGILON is built for extreme efficiency using high-performance asynchronous frameworks.
2. **Alert Fatigue & Duplicate Incidents**: SOC teams are overwhelmed by thousands of recurring alerts. AEGILON solves this with **Smart Duplicate Prevention (`occurrence++`)**, consolidating recurring alerts into open incidents rather than creating duplicate tickets.
3. **Fragmented Security Stack**: Unifies telemetry ingestion, threat detection, risk scoring, digital evidence gathering, audit logging, and automated SOAR response into a single, cohesive platform.

### Why Choose AEGILON?
- ⚡ **Low-Overhead Architecture**: Built on FastAPI & PostgreSQL (Supabase) asynchronous non-blocking drivers.
- 🎯 **Smart Deduplication & Evidence Management**: Automatically filters noise and attaches raw evidence logs to active incidents.
- 🤖 **End-to-End SOAR Integration**: Automated scenario-based playbooks with n8n workflow support and instant Telegram alert notifications.
- 📊 **Dynamic Risk Scoring**: Automatic severity scoring based on threat impact, MITRE ATT&CK mapping, and asset criticality.
- 🕒 **Full Timezone Normalization (WIB / UTC+7)**: Accurate timestamp alignment across all telemetry, logs, audit trails, and incident IDs.

---

## 📂 Project Directory Structure

Below is the 1-by-1 breakdown of every directory and module in the AEGILON workspace:

```text
aegilon/
├── Aegilon/                         # Core Microservices Architecture
│   ├── frontend/                    # Next.js 14 Web Application (SOC Analyst Dashboard)
│   ├── backend/                     # FastAPI Core API & Orchestrator
│   ├── detection-engine/            # Behavior & ML Threat Detection Engine
│   ├── risk-engine/                 # Dynamic Risk Assessment & Scoring Engine
│   ├── automation-engine/           # SOAR Playbooks & Telegram Automation Engine
│   ├── docs/                        # Technical Architecture Documentation & API Specs
│   └── scripts/                     # Seeder Scripts & Database Utilities
├── detection/                       # Wazuh SIEM Custom Detection Rules (XML)
├── n8n/                             # SOAR Automation Workflows & Telegram Integration Schemas
├── report/                          # Comprehensive Technical Project Reports & Documents
├── scripts/                         # Root Management & Helper Scripts
├── wazuh-docker/                    # Dockerized Wazuh Manager & SIEM Deployment Stack
├── docker-compose.yml               # Multi-container Microservice Orchestration Setup
└── README.md                        # Primary Project Documentation
```

### Folder Breakdown (1-by-1)

#### 1. `Aegilon/` (Core Microservices Container)
The primary application directory housing all independent microservices that form the AEGILON XDR platform:
- **`Aegilon/frontend/`**: Built with **Next.js 14**, **React**, **TypeScript**, and **Tailwind CSS**. Provides a real-time responsive Web UI for SOC Analysts to monitor alerts, triage incidents, view telemetry, manage playbooks, and inspect audit logs.
- **`Aegilon/backend/`**: Built with **FastAPI** (Python 3.10+). Acts as the central backend orchestrator, providing RESTful API endpoints, JWT authentication, Database ORM (PostgreSQL/Supabase), background sync loops, and event dispatchers.
- **`Aegilon/detection-engine/`**: Microservice dedicated to threat detection. Executes dynamic rules from the database every 10 seconds and runs Machine Learning (Isolation Forest) anomaly detection against raw telemetry log data.
- **`Aegilon/risk-engine/`**: Microservice that evaluates threat severity (`Low`, `Medium`, `High`, `Critical`) and calculates contextual risk scores based on asset criticality and MITRE ATT&CK technique weights.
- **`Aegilon/automation-engine/`**: Microservice responsible for SOAR actions. Triggers automated playbooks, sends real-time alert notifications to Telegram, and dispatches webhooks to n8n workflows.
- **`Aegilon/docs/`**: Technical design documents, architecture diagrams, and system specifications.
- **`Aegilon/scripts/`**: Helper scripts for seeding detection rules (`seed_detection_rules.py`), mock incidents (`seed_mock_data.py`), and test runners.

#### 2. `detection/` (Custom Wazuh XML Rules)
Contains custom XML rule files used to configure the Wazuh SIEM Manager for endpoint telemetry collection:
- `aegilon_process.xml`: Rules for monitoring suspicious process creation (e.g., CMD/PowerShell execution, privilege escalation).
- `aegilon_network.xml`: Rules for suspicious network connections, beaconing, and port scans.
- `aegilon_login.xml`: Rules for brute-force login attempts and authentication failures.
- `aegilon_persistence.xml`: Rules for registry modifications, startup scripts, and scheduled tasks.
- `aegilon_file.xml`: Rules for file creation, integrity monitoring, and ransomware behavior.
- `aegilon_correlation.xml`: Multi-event correlation rules across telemetry types.

#### 3. `n8n/` (Automation Workflows)
Contains JSON workflow definitions and guides for n8n SOAR integration:
- `telegram_notification_workflow.json`: Pre-configured n8n workflow for sending formatted threat alerts and action buttons to Telegram.
- `README.md`: Setup guide for importing and activating n8n workflows.

#### 4. `report/`
Contains official project presentation documentation and full PDF technical defense reports (`Group 3 - Aegilon.pdf`).

#### 5. `scripts/`
Root-level utility scripts for system deployment, environment setup, and automated testing.

#### 6. `wazuh-docker/`
Complete Docker Compose deployment stack for running a multi-node or single-node Wazuh Manager, Wazuh Indexer, and Wazuh Dashboard locally or on server environments.

---

## 🖥️ Web Dashboard Pages & Features (1-by-1 Breakdown)

The AEGILON Analyst Dashboard (`Aegilon/frontend`) is organized into dedicated feature pages accessible from the main navigation sidebar:

```text
frontend/src/app/(dashboard)/
├── page.tsx                         # 📊 Overview Dashboard (Home)
├── incidents/                       # 📝 Incident Management & Triage
│   ├── page.tsx                     #    └─ Incidents List & Filtering
│   └── [id]/page.tsx                #    └─ Detailed Incident Investigation Panel
├── alerts/                          # 🔔 Telemetry & Alert Monitoring
│   └── page.tsx                     #    └─ Raw Telemetry Feed & Ingestion Status
├── hosts/                           # 🖥️ Host & Endpoint Inventory
│   └── page.tsx                     #    └─ Endpoint Discovery & Health Monitoring
├── playbooks/                       # 🤖 SOAR Playbooks
│   └── page.tsx                     #    └─ Automated Playbook Management
├── responses/                       # ⚡ Active Response History
│   └── page.tsx                     #    └─ Response Action Execution Logs
├── rules/                           # 🎯 Detection Rules Management
│   └── page.tsx                     #    └─ Dynamic Rule Configuration & MITRE Mapping
├── audit-logs/                      # 🗃️ Enterprise Audit Trail
│   └── page.tsx                     #    └─ SOC Analyst Activity & Compliance Logs
├── iso-standards/                   # 📜 ISO Standards Compliance
│   └── page.tsx                     #    └─ ISO 27001 Control Mapping & Metrics
└── settings/                        # ⚙️ Platform Settings
    └── page.tsx                     #    └─ System Configurations, API Keys & Profiles
```

### Detailed Feature & Page Descriptions

#### 1. 📊 Overview Dashboard Page (`/`)
- **Key Features**:
  - **SOC Summary Widgets**: Real-time counters for active incidents, total alerts ingested, host statuses, and system health.
  - **Severity Distribution Charts**: Visual Breakdown of threats by severity (`Low`, `Medium`, `High`, `Critical`).
  - **Recent Incident Stream**: Live feed of newly opened incidents requiring immediate analyst triage.
  - **Host Status Monitor**: Status indicators showing online/offline Windows endpoints monitored by Wazuh/Osquery.

#### 2. 📝 Incident Management Page (`/incidents` & `/incidents/[id]`)
- **Key Features**:
  - **Incident List View (`/incidents`)**: Filterable table of all security incidents sorted by status (`Open`, `Investigating`, `Contained`, `Resolved`, `Closed`), severity, and assigned analyst.
  - **Dynamic Sequence Numbering**: Structured incident numbering in WIB format (`INC-YYYYMMDD-XXXX`).
  - **Smart Duplicate Prevention (`occurrence++`)**: Consolidates new alerts into existing open incidents if matching threat signatures and active hosts are detected.
  - **Detailed Investigation Panel (`/incidents/[id]`)**:
    - **Evidence Alert Timeline**: Chronological digital evidence log attached to the incident.
    - **Lifecycle Status Transition**: One-click status updates (`Open` ➔ `Investigating` ➔ `Contained` ➔ `Resolved` ➔ `Closed`).
    - **Audit History Trail**: Complete record of analyst notes, status changes, and time of actions.
    - **Quick SOAR Actions**: Trigger mitigation directly from the incident investigation page.

#### 3. 🔔 Telemetry Alerts Monitoring Page (`/alerts`)
- **Key Features**:
  - **Raw Alert Stream**: Comprehensive list of raw telemetry alerts ingested from Wazuh SIEM every 5 seconds.
  - **Filter & Search**: Search by Rule ID, Agent Name, MITRE Technique, Severity, or Process Name.
  - **Raw Log Inspector**: Expandable JSON viewer for deep-dive analysis of raw agent event data.

#### 4. 🖥️ Host & Endpoint Inventory Page (`/hosts`)
- **Key Features**:
  - **Auto-Discovery**: Automatic host registration when a new Windows endpoint sends telemetry.
  - **Endpoint Health Details**: Inspect Hostname, IP Address, OS Version, Agent Status, and Last Keepalive Timestamp.
  - **Host Risk Score**: Individual host risk assessment based on recent threat activity.

#### 5. 🤖 SOAR Playbooks Page (`/playbooks`)
- **Key Features**:
  - **Playbook Library**: List of pre-configured automated response playbooks (e.g., Host Isolation, Process Termination, IP Blocking).
  - **Trigger Conditions**: Configure automatic execution thresholds based on incident severity or rule categories.
  - **Enable/Disable Controls**: Toggle playbooks on or off based on operational SOC requirements.

#### 6. ⚡ Active Response Execution Log Page (`/responses`)
- **Key Features**:
  - **Execution Audit**: Log history of all automated and manual response actions executed across endpoints.
  - **Status Tracker**: View response status (`Success`, `Pending`, `Failed`) with execution timestamps and target host information.

#### 7. 🎯 Detection Rules Management Page (`/rules`)
- **Key Features**:
  - **Dynamic Rule Engine**: Manage detection rules stored centrally in PostgreSQL without needing server restarts.
  - **MITRE ATT&CK Mapping**: Every rule is mapped to standard MITRE ATT&CK Tactics and Techniques (e.g., Execution, Persistence, Privilege Escalation).
  - **Rule Severity & Parameters**: Adjust severity weights, threshold counters, and rule logic dynamically.

#### 8. 🗃️ Enterprise Audit Logs Page (`/audit-logs`)
- **Key Features**:
  - **SOC Activity Tracking**: Full audit log recording analyst logins, incident status changes, rule modifications, and playbook executions.
  - **Client IP & User Attribution**: Tracks the exact analyst username, timestamp, action type, and IP address for compliance audits.

#### 9. 📜 ISO Standards Compliance Page (`/iso-standards`)
- **Key Features**:
  - **ISO 27001 Mapping**: Maps platform capabilities and detection coverage directly to ISO/IEC 27001 controls (e.g., A.12.4 Logging and Monitoring, A.16 Incident Management).
  - **Compliance Scorecards**: Executive visual metrics demonstrating security posture and audit readiness.

#### 10. ⚙️ Platform Settings Page (`/settings`)
- **Key Features**:
  - **Integration Credentials**: Manage Wazuh API, Telegram Bot Token, Chat ID, and n8n Webhook URLs.
  - **User Profile & JWT Tokens**: Update analyst account details and security settings.
  - **Timezone Settings**: View active timezone normalization settings (Default: `Asia/Jakarta`, WIB).

---

## 📋 Prerequisites

Ensure your environment meets the following requirements before installing AEGILON:

| Software | Minimum Version | Description |
|---|---|---|
| **Docker & Docker Compose** | Docker v20.10+ / Compose v2.0+ | Required for microservices containerization |
| **Node.js** | v18.0.0+ | Required for running frontend locally outside Docker |
| **Python** | v3.10+ | Required for backend development and script execution |
| **PostgreSQL / Supabase** | v14+ | Core database for telemetry, alerts, incidents & rules |
| **Wazuh Manager** | v4.x | SIEM Manager for host telemetry agent collection |

---

## 🚀 Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/ryl-code/aegilon.git
cd aegilon
```

### Step 2: Configure Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Populate the `.env` file with your credentials:
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

### Step 3: Build & Start Microservices
Run the entire AEGILON stack using Docker Compose:

```bash
docker compose up --build -d
```

Verify that all containers are healthy and running:
```bash
docker compose ps
```

### Step 4: Initialize Detection Rules
Run the database seeder to populate default detection rules:
```bash
docker compose exec backend python /app/seed_detection_rules.py
```

---

## 💡 Usage

### 1. Accessing the SOC Analyst Dashboard
Open your browser and navigate to:
- **Dashboard URL**: `http://localhost:3002`
- **FastAPI Documentation (Swagger UI)**: `http://localhost:8080/docs`

### 2. Incident Triage Workflow
1. Navigate to **Incidents** (`/incidents`) on the Dashboard.
2. Select an active incident formatted as `INC-YYYYMMDD-XXXX`.
3. Inspect the **Evidence Alerts** panel to examine threat evidence logs.
4. Transition the incident lifecycle (`Open` ➔ `Investigating` ➔ `Contained` ➔ `Resolved` ➔ `Closed`). All actions are logged to the audit trail automatically.

---

## 📖 API Reference

AEGILON Backend provides an interactive OpenAPI / Swagger UI at **`http://localhost:8080/docs`**.

### Core Endpoints Summary

| Category | Method | Endpoint | Description | Auth |
|---|---|---|---|---|
| **Authentication** | `POST` | `/auth/login` | Authenticate user & obtain JWT Access Token | ❌ No |
| | `GET` | `/auth/me` | Retrieve authenticated user profile details | ✅ Yes |
| **Health Check** | `GET` | `/health` | Check backend server & database status | ❌ No |
| **Hosts** | `GET` | `/hosts` | List all registered endpoint hosts | ✅ Yes |
| | `GET` | `/hosts/{id}` | Get host telemetry details by ID | ✅ Yes |
| **Alerts** | `GET` | `/alerts` | List telemetry alerts (paginated) | ✅ Yes |
| | `GET` | `/alerts/unprocessed` | Retrieve unprocessed alerts with `new` status | ✅ Yes |
| **Incidents** | `GET` | `/incidents` | List incidents (filter by severity/status) | ✅ Yes |
| | `GET` | `/incidents/stats` | Retrieve incident statistics for dashboard widgets | ✅ Yes |
| | `GET` | `/incidents/{id}` | Get detailed incident breakdown | ✅ Yes |
| | `GET` | `/incidents/{id}/history` | Retrieve incident audit trail history | ✅ Yes |
| | `GET` | `/incidents/{id}/alerts` | List digital evidence alerts for an incident | ✅ Yes |
| | `POST` | `/incidents` | Create a new incident entry manually | ✅ Yes |
| | `PATCH` | `/incidents/{id}/status` | Update incident lifecycle status | ✅ Yes |
| **Detection** | `POST` | `/detection/run` | Trigger backend detection engine scan | ✅ Yes |
| **Audit Logs** | `GET` | `/audit-logs` | List SOC analyst audit trail logs | ✅ Yes |

---

## 🧪 Testing

AEGILON includes test scripts for verifying core detection logic and incident management:

```bash
# Test Incident Management & Smart Deduplication
docker compose run --entrypoint python backend /app/test_incident_management.py

# Test Detection Engine & Log Parsing
docker compose run --entrypoint python backend /app/test_detection_engine.py
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Development Team**: AEGILON XDR Security Team
- **GitHub Repository**: [https://github.com/ryl-code/aegilon](https://github.com/ryl-code/aegilon)
- **Documentation & Support**: `support@aegilon.sec`

---

<p align="center">
  <i>Developed with ❤️ for Advanced Cyber Threat Defense.</i>
</p>
