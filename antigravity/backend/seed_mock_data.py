import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.database.database import engine, AsyncSessionLocal
from app.models.host import Host
from app.models.rule import Rule
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.incident_alert import IncidentAlert
from app.models.response import Response

async def main():
    print("Connecting to database...")
    wib = ZoneInfo("Asia/Jakarta")
    now_tz = datetime.now(wib)
    
    async with AsyncSessionLocal() as db:
        # Check if hosts already exist
        res = await db.execute(select(Host))
        existing_hosts = res.scalars().all()
        if existing_hosts:
            print("Database already has data. Skipping mock seeding.")
            await engine.dispose()
            return
            
        print("Seeding mock hosts...")
        host1 = Host(
            id=uuid.uuid4(),
            hostname="host-monitoring-win",
            agent_id="001",
            ip_address="192.168.1.15",
            operating_system="Windows 11",
            status="active",
            last_seen=now_tz,
            created_at=now_tz - timedelta(days=5)
        )
        host2 = Host(
            id=uuid.uuid4(),
            hostname="production-web-srv",
            agent_id="002",
            ip_address="10.0.0.4",
            operating_system="Ubuntu 22.04 LTS",
            status="active",
            last_seen=now_tz,
            created_at=now_tz - timedelta(days=10)
        )
        db.add_all([host1, host2])
        await db.flush() # Populate IDs
        
        # Query rules to link them
        rules_res = await db.execute(select(Rule))
        rules = rules_res.scalars().all()
        rule_map = {r.rule_id: r for r in rules}
        
        # Fallback if no rules exist
        if not rules:
            print("No rules found in database. Make sure you seeded rules first!")
            await engine.dispose()
            return
            
        rule_200001 = rule_map.get(200001) or rules[0]
        rule_200002 = rule_map.get(200002) or rules[0]
        rule_200004 = rule_map.get(200004) or rules[0]
        
        print("Seeding mock alerts...")
        alert1 = Alert(
            id=uuid.uuid4(),
            event_id="evt-mimikatz-dump-1",
            host_id=host1.id,
            rule_id=rule_200001.id,
            wazuh_level=13,
            severity="Critical",
            title="Wazuh Alert 200001: Credential Dumping (Mimikatz)",
            description="Process mimikatz.exe detected attempting to read LSASS memory.",
            raw_log={"event": "mimikatz", "process_name": "mimikatz.exe", "path": "C:\\temp\\mimikatz.exe"},
            status="unprocessed",
            created_at=now_tz - timedelta(hours=2)
        )
        alert2 = Alert(
            id=uuid.uuid4(),
            event_id="evt-lsass-dump-1",
            host_id=host1.id,
            rule_id=rule_200002.id,
            wazuh_level=10,
            severity="High",
            title="Wazuh Alert 200002: Lsass Process Dump",
            description="Process procdump.exe triggered with arguments containing lsass.",
            raw_log={"event": "procdump", "cmdline": "procdump.exe -ma lsass.exe"},
            status="unprocessed",
            created_at=now_tz - timedelta(hours=1.5)
        )
        alert3 = Alert(
            id=uuid.uuid4(),
            event_id="evt-ps-exec-1",
            host_id=host2.id,
            rule_id=rule_200004.id,
            wazuh_level=9,
            severity="High",
            title="Wazuh Alert 200004: Suspicious PowerShell Execution",
            description="PowerShell process started with encoded command flags.",
            raw_log={"event": "powershell", "cmdline": "powershell.exe -enc ZQBjAGgAbwAgACIASABhAGMAawBlAGQAIgA="},
            status="processed",
            created_at=now_tz - timedelta(hours=4)
        )
        db.add_all([alert1, alert2, alert3])
        await db.flush()
        
        print("Seeding mock incidents...")
        # Incident 1 (Mimikatz credential access)
        incident1 = Incident(
            id=uuid.uuid4(),
            incident_number="INC-2026-0001",
            title="Active Mimikatz & LSASS Dump Threat",
            description="Multiple indicators of credential dumping activities detected on Windows endpoint.",
            rule_id=rule_200001.id,
            host_id=host1.id,
            severity="Critical",
            priority="High",
            status="Open",
            category="Credential Access",
            confidence=95,
            risk_score=9.5,
            occurrence=2,
            first_seen=now_tz - timedelta(hours=2),
            last_seen=now_tz - timedelta(hours=1.5),
            created_at=now_tz - timedelta(hours=2)
        )
        # Incident 2 (Suspicious PowerShell execution)
        incident2 = Incident(
            id=uuid.uuid4(),
            incident_number="INC-2026-0002",
            title="Suspicious Obfuscated PowerShell Command",
            description="Encoded command-line execution flagged under MITRE T1059.001 Execution.",
            rule_id=rule_200004.id,
            host_id=host2.id,
            severity="High",
            priority="Medium",
            status="Open",
            category="Execution",
            confidence=80,
            risk_score=7.8,
            occurrence=1,
            first_seen=now_tz - timedelta(hours=4),
            last_seen=now_tz - timedelta(hours=4),
            created_at=now_tz - timedelta(hours=4)
        )
        db.add_all([incident1, incident2])
        await db.flush()
        
        # Add Incident Alerts evidence relationships
        inc_alert1 = IncidentAlert(incident_id=incident1.id, alert_id=alert1.id, created_at=now_tz - timedelta(hours=2))
        inc_alert2 = IncidentAlert(incident_id=incident1.id, alert_id=alert2.id, created_at=now_tz - timedelta(hours=1.5))
        inc_alert3 = IncidentAlert(incident_id=incident2.id, alert_id=alert3.id, created_at=now_tz - timedelta(hours=4))
        db.add_all([inc_alert1, inc_alert2, inc_alert3])
        
        print("Seeding mock responses...")
        response1 = Response(
            id=uuid.uuid4(),
            incident_id=incident1.id,
            action="Kill Process",
            status="success",
            message="Successfully terminated mimikatz.exe (PID 3144)",
            executed_at=now_tz - timedelta(hours=1.8)
        )
        response2 = Response(
            id=uuid.uuid4(),
            incident_id=incident1.id,
            action="Telegram Alert",
            status="success",
            message="Telegram notification sent to channel successfully.",
            executed_at=now_tz - timedelta(hours=1.9)
        )
        response3 = Response(
            id=uuid.uuid4(),
            incident_id=incident2.id,
            action="Monitor Log",
            status="success",
            message="Process logged. Continuous monitoring active.",
            executed_at=now_tz - timedelta(hours=3.9)
        )
        db.add_all([response1, response2, response3])
        
        await db.commit()
        print("Mock data seeded successfully!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
