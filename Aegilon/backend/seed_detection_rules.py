import asyncio
import json
import ssl
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.database.database import database_url, connect_args
from app.models.rule import Rule
from sqlalchemy import select

# Seed rules dataset matching DETECTION_RULE_ENGINE.md
RULES_DATA = [
    {
        "rule_id": 200001,
        "name": "Credential Dumping (Mimikatz)",
        "mitre": "T1003",
        "severity": "Critical",
        "description": json.dumps({"process_name": "mimikatz.exe", "confidence": 95, "category": "Credential Access"}),
        "enabled": True
    },
    {
        "rule_id": 200002,
        "name": "Lsass Process Dump",
        "mitre": "T1003.001",
        "severity": "High",
        "description": json.dumps({"process_name": "procdump.exe", "cmdline_contains": "lsass", "confidence": 85, "category": "Credential Access"}),
        "enabled": True
    },
    {
        "rule_id": 200003,
        "name": "Comsvcs Lsass Dump",
        "mitre": "T1003.001",
        "severity": "High",
        "description": json.dumps({"process_name": "rundll32.exe", "cmdline_contains": "comsvcs.dll", "confidence": 85, "category": "Credential Access"}),
        "enabled": True
    },
    {
        "rule_id": 200004,
        "name": "Suspicious PowerShell Execution",
        "mitre": "T1059.001",
        "severity": "High",
        "description": json.dumps({"process_name": "powershell.exe", "confidence": 80, "category": "Execution"}),
        "enabled": True
    },
    {
        "rule_id": 200005,
        "name": "Mshta Execution",
        "mitre": "T1218.005",
        "severity": "High",
        "description": json.dumps({"process_name": "mshta.exe", "confidence": 85, "category": "Execution"}),
        "enabled": True
    },
    {
        "rule_id": 200006,
        "name": "Wscript Execution",
        "mitre": "T1059.005",
        "severity": "Medium",
        "description": json.dumps({"process_name": "wscript.exe", "confidence": 75, "category": "Execution"}),
        "enabled": True
    },
    {
        "rule_id": 200007,
        "name": "Cscript Execution",
        "mitre": "T1059.005",
        "severity": "Medium",
        "description": json.dumps({"process_name": "cscript.exe", "confidence": 75, "category": "Execution"}),
        "enabled": True
    },
    {
        "rule_id": 200008,
        "name": "Regsvr32 Execution",
        "mitre": "T1218.010",
        "severity": "Medium",
        "description": json.dumps({"process_name": "regsvr32.exe", "confidence": 70, "category": "Execution"}),
        "enabled": True
    },
    {
        "rule_id": 200009,
        "name": "Lateral Movement (PsExec)",
        "mitre": "T1569",
        "severity": "High",
        "description": json.dumps({"process_name": "psexec.exe", "confidence": 90, "category": "Lateral Movement"}),
        "enabled": True
    },
    {
        "rule_id": 200010,
        "name": "Wmic Execution",
        "mitre": "T1047",
        "severity": "Medium",
        "description": json.dumps({"process_name": "wmic.exe", "confidence": 75, "category": "Lateral Movement"}),
        "enabled": True
    },
    {
        "rule_id": 200011,
        "name": "Whoami Discovery",
        "mitre": "T1033",
        "severity": "Low",
        "description": json.dumps({"process_name": "whoami.exe", "confidence": 60, "category": "Discovery"}),
        "enabled": True
    },
    {
        "rule_id": 200012,
        "name": "Net User Discovery",
        "mitre": "T1087",
        "severity": "Low",
        "description": json.dumps({"process_name": "net.exe", "cmdline_contains": "user", "confidence": 60, "category": "Discovery"}),
        "enabled": True
    },
    {
        "rule_id": 200013,
        "name": "Systeminfo Discovery",
        "mitre": "T1082",
        "severity": "Low",
        "description": json.dumps({"process_name": "systeminfo.exe", "confidence": 55, "category": "Discovery"}),
        "enabled": True
    },
    {
        "rule_id": 200014,
        "name": "Schtasks Persistence",
        "mitre": "T1053.005",
        "severity": "High",
        "description": json.dumps({"process_name": "schtasks.exe", "confidence": 80, "category": "Persistence"}),
        "enabled": True
    },
    {
        "rule_id": 200015,
        "name": "Wevtutil Log Clearing",
        "mitre": "T1070.001",
        "severity": "High",
        "description": json.dumps({"process_name": "wevtutil.exe", "cmdline_contains": "cl", "confidence": 85, "category": "Defense Evasion"}),
        "enabled": True
    },
    {
        "rule_id": 200016,
        "name": "Rar Collection",
        "mitre": "T1560.001",
        "severity": "Medium",
        "description": json.dumps({"process_name": "rar.exe", "confidence": 70, "category": "Collection"}),
        "enabled": True
    },
    {
        "rule_id": 200017,
        "name": "7z Collection",
        "mitre": "T1560.001",
        "severity": "Medium",
        "description": json.dumps({"process_name": "7z.exe", "confidence": 65, "category": "Collection"}),
        "enabled": True
    },
    {
        "rule_id": 200018,
        "name": "Bitsadmin Exfiltration",
        "mitre": "T1197",
        "severity": "High",
        "description": json.dumps({"process_name": "bitsadmin.exe", "confidence": 80, "category": "Exfiltration"}),
        "enabled": True
    },
    {
        "rule_id": 200019,
        "name": "Certutil Download",
        "mitre": "T1105",
        "severity": "Medium",
        "description": json.dumps({"process_name": "certutil.exe", "cmdline_contains": "urlcache", "confidence": 75, "category": "Exfiltration"}),
        "enabled": True
    },
    {
        "rule_id": 200020,
        "name": "Rundll32 Web Execution",
        "mitre": "T1218.011",
        "severity": "High",
        "description": json.dumps({"process_name": "rundll32.exe", "cmdline_contains": "http", "confidence": 80, "category": "Execution"}),
        "enabled": True
    }
]

async def main():
    print("Connecting to Supabase database to seed rules...")
    engine = create_async_engine(database_url, connect_args=connect_args)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    wib = ZoneInfo("Asia/Jakarta")
    
    async with AsyncSessionLocal() as db:
        for r_data in RULES_DATA:
            # Check if rule exists
            query = select(Rule).where(Rule.rule_id == r_data["rule_id"])
            res = await db.execute(query)
            existing = res.scalar_one_or_none()
            
            if existing:
                print(f"Rule ID {r_data['rule_id']} ('{r_data['name']}') already exists. Updating...")
                existing.name = r_data["name"]
                existing.mitre = r_data["mitre"]
                existing.severity = r_data["severity"]
                existing.description = r_data["description"]
                existing.enabled = r_data["enabled"]
            else:
                print(f"Creating Rule ID {r_data['rule_id']} ('{r_data['name']}')...")
                new_rule = Rule(
                    rule_id=r_data["rule_id"],
                    name=r_data["name"],
                    mitre=r_data["mitre"],
                    severity=r_data["severity"],
                    description=r_data["description"],
                    enabled=r_data["enabled"],
                    created_at=datetime.now(wib)
                )
                db.add(new_rule)
                
        await db.commit()
        print("Successfully seeded all detection rules!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
