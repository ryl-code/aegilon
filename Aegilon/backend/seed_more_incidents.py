import asyncio
import uuid
import random
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.database.database import engine, AsyncSessionLocal
from app.models.host import Host
from app.models.rule import Rule
from app.models.incident import Incident
from sqlalchemy import select

async def main():
    print("Generating 30 more incidents...")
    wib = ZoneInfo("Asia/Jakarta")
    now_tz = datetime.now(wib)
    
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Host))
        hosts = res.scalars().all()
        
        res_rules = await db.execute(select(Rule))
        rules = res_rules.scalars().all()
        
        if not hosts or not rules:
            print("Need hosts and rules first!")
            await engine.dispose()
            return
            
        new_incidents = []
        for i in range(30):
            host = random.choice(hosts)
            rule = random.choice(rules)
            inc = Incident(
                id=uuid.uuid4(),
                incident_number=f"INC-2026-1{i:03d}",
                title=f"Mock Incident: {rule.name} on {host.hostname}",
                description="This is an automatically generated mock incident to test pagination.",
                rule_id=rule.id,
                host_id=host.id,
                severity=random.choice(["Low", "Medium", "High", "Critical"]),
                priority=random.choice(["Low", "Medium", "High", "Critical"]),
                status=random.choice(["Open", "In Progress", "Closed"]),
                category="Execution",
                confidence=random.randint(40, 100),
                risk_score=random.uniform(2.0, 9.9),
                occurrence=random.randint(1, 15),
                first_seen=now_tz - timedelta(hours=random.randint(1, 48)),
                last_seen=now_tz - timedelta(hours=random.randint(0, 5)),
                created_at=now_tz - timedelta(hours=random.randint(0, 48))
            )
            new_incidents.append(inc)
            
        db.add_all(new_incidents)
        await db.commit()
        print(f"Successfully added {len(new_incidents)} incidents!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
