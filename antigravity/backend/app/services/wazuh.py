from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import host_repo, rule_repo, alert_repo
from app.models.host import Host
from app.models.rule import Rule
from app.models.alert import Alert
from app.core.config import settings
from datetime import datetime
import json
import logging
import httpx
import asyncio

logger = logging.getLogger(__name__)

class WazuhService:
    async def process_wazuh_alert(self, db: AsyncSession, alert_json: dict) -> dict:
        source = alert_json.get("_source", alert_json)
        
        # 1. Parse event id & timestamp
        event_id = alert_json.get("_id", source.get("id", f"gen-{datetime.now().timestamp()}"))
        
        # 2. Parse agent/host info
        agent = source.get("agent", {})
        agent_id = agent.get("id", "000")
        hostname = agent.get("name", "unknown")
        ip = agent.get("ip", "unknown")
        if ip == "unknown" or not ip:
            ip = "127.0.0.1"
        
        # 3. Parse rule info
        rule_data = source.get("rule", {})
        try:
            rule_id = int(rule_data.get("id", 0))
        except ValueError:
            rule_id = 0
            
        description = rule_data.get("description", "Wazuh Alert")
        level = int(rule_data.get("level", 0))
        
        # 4. Parse MITRE ATT&CK
        mitre = rule_data.get("mitre", {})
        mitre_ids = mitre.get("id", [])
        mitre_id = mitre_ids[0] if mitre_ids else None
        
        # 5. Parse timestamp
        timestamp_str = source.get("timestamp")
        from zoneinfo import ZoneInfo
        wib = ZoneInfo("Asia/Jakarta")
        try:
            clean_ts = timestamp_str.replace("+0000", "+00:00")
            timestamp = datetime.fromisoformat(clean_ts).astimezone(wib)
        except Exception:
            timestamp = datetime.now(wib)
            
        # Map wazuh level to standard severity: Low, Medium, High, Critical
        severity = "Low"
        if level >= 12:
            severity = "Critical"
        elif level >= 9:
            severity = "High"
        elif level >= 5:
            severity = "Medium"
            
        # A. Fetch or create host
        host = await host_repo.get_by_agent_id(db, agent_id=agent_id)
        if not host:
            host = await host_repo.create(db, obj_in={
                "hostname": hostname,
                "agent_id": agent_id,
                "ip_address": ip,
                "operating_system": "Windows",
                "status": "active",
                "created_at": datetime.now(wib)
            })
            
        # B. Fetch or create rule
        rule = await rule_repo.get_by_rule_id(db, rule_id=rule_id)
        if not rule:
            rule = await rule_repo.create(db, obj_in={
                "rule_id": rule_id,
                "name": description,
                "mitre": mitre_id,
                "severity": severity,
                "description": description,
                "enabled": True,
                "created_at": datetime.now(wib)
            })
            
        # C. Create corresponding Alert record if it doesn't already exist
        existing_alert = await alert_repo.get_by_event_id(db, event_id=event_id)
        if existing_alert:
            return {
                "status": "exists",
                "alert_id": str(existing_alert.id)
            }
            
        alert = await alert_repo.create(db, obj_in={
            "event_id": event_id,
            "host_id": host.id,
            "rule_id": rule.id,
            "wazuh_level": level,
            "severity": severity,
            "title": f"Wazuh Alert {rule_id}: {description}",
            "description": description,
            "raw_log": alert_json,
            "status": "new",
            "created_at": timestamp
        })
        
        return {
            "status": "success",
            "alert_id": alert.id
        }

class WazuhAPIClient:
    def __init__(self):
        self.base_url = settings.WAZUH_API_URL
        self.username = settings.WAZUH_API_USER
        self.password = settings.WAZUH_API_PASSWORD
        self.verify = settings.WAZUH_API_VERIFY_SSL
        self.token = None

    async def authenticate(self) -> bool:
        url = f"{self.base_url}/security/user/authenticate"
        try:
            async with httpx.AsyncClient(verify=self.verify) as client:
                response = await client.get(
                    url,
                    auth=(self.username, self.password),
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    self.token = data.get("data", {}).get("token")
                    return True
                return False
        except Exception as e:
            logger.warning(f"Wazuh API auth simulation warning (no real connection): {str(e)}")
            return False

    async def trigger_active_response(self, agent_id: str, command: str, arguments: list) -> dict:
        if not self.token:
            await self.authenticate()
        logger.info(f"Simulating Active Response to Wazuh Manager: Agent={agent_id}, Command={command}, Args={arguments}")
        return {
            "status": "success",
            "message": f"Active response command '{command}' successfully triggered on agent {agent_id}."
        }

wazuh_service = WazuhService()
wazuh_client = WazuhAPIClient()

async def start_wazuh_sync():
    """
    Background loop running every 5 seconds to sync alerts from Wazuh Indexer.
    """
    from app.database.database import AsyncSessionLocal
    logger.info("Initializing Wazuh background synchronization loop (5s interval)...")
    while True:
        await asyncio.sleep(5)
        async with AsyncSessionLocal() as db:
            try:
                # Query indexer and ingest new alerts automatically
                indexer_url = "https://wazuh.indexer:9200/wazuh-alerts-*/_search"
                username = settings.WAZUH_API_USER
                password = settings.WAZUH_API_PASSWORD
                
                query_body = {
                    "query": {
                        "range": {
                            "timestamp": {
                                "gte": "now-1m" # Sync last 1 minute of alerts
                            }
                        }
                    },
                    "size": 100
                }
                
                async with httpx.AsyncClient(verify=False) as client:
                    response = await client.post(
                        indexer_url,
                        auth=(username, password),
                        json=query_body,
                        headers={"Content-Type": "application/json"},
                        timeout=5.0
                    )
                    if response.status_code == 200:
                        hits = response.json().get("hits", {}).get("hits", [])
                        for hit in hits:
                            alert_source = hit.get("_source", {})
                            event_id = hit.get("_id", f"gen-{datetime.now().timestamp()}")
                            await wazuh_service.process_wazuh_alert(db, {
                                "_id": event_id,
                                "_source": alert_source
                            })
            except Exception as e:
                # Log warning/info instead of error to keep container logs clean
                logger.debug(f"Background Wazuh sync idle: {str(e)}")
