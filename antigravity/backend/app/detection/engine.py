from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import AsyncSessionLocal
from app.repositories import alert_repo
from app.models.alert import Alert
from app.detection.logger import logger
from app.detection.parser import parser
from app.detection.rules import rules_loader
from app.detection.matcher import matcher
from app.detection.severity import severity_calculator
from app.detection.duplicate import duplicate_checker
from app.detection.incident import incident_generator
import asyncio

class DetectionEngine:
    def __init__(self):
        self.is_running = False

    async def analyze_single_alert(self, db: AsyncSession, alert: Alert, rules: list) -> bool:
        try:
            # 1. Parse raw log
            parsed = parser.parse_alert(alert.raw_log)
            proc_name = parsed.get("process_name", "")
            
            # 2. Match rule
            matched_rule = matcher.match_rule(parsed, rules)
            if not matched_rule:
                logger.info(f"[INFO] Analyzed alert {alert.id} (process: {proc_name}) -> Marked as processed (no threat rule triggered)")
                await alert_repo.update(db, db_obj=alert, obj_in={"status": "processed"})
                return True
                
            rule_name = matched_rule["name"]
            
            # 3. Calculate severity
            sev_info = severity_calculator.calculate(matched_rule, alert.wazuh_level)
            severity = sev_info["severity"]
            confidence = sev_info["confidence"]
            
            conditions = matched_rule.get("conditions", {})
            category = conditions.get("category", "Execution")
            rule_uuid = matched_rule["db_rule"].id
            
            # 4. Handle detection and incident lifecycle via IncidentManager
            from app.incident.manager import incident_manager
            incident = await incident_manager.handle_detection(
                db=db,
                alert=alert,
                rule_id=rule_uuid,
                rule_name=rule_name,
                category=category,
                severity=severity,
                confidence=confidence,
                priority="Low"
            )
            
            # 5. Mark alert as processed
            await alert_repo.update(db, db_obj=alert, obj_in={"status": "processed"})
            
            logger.info(f"[INFO] Alert {alert.id} analyzed -> Incident {incident.incident_number} (Rule: {rule_name})")
            return True
            
        except Exception as e:
            logger.error(f"[ERROR] Invalid Alert {alert.id}: {str(e)}")
            return False

    async def run_once(self) -> int:
        async with AsyncSessionLocal() as db:
            # 1. Load active rules
            rules = await rules_loader.load_rules(db)
            if not rules:
                return 0
                
            # 2. Fetch unprocessed (new) alerts (newest first)
            query = select(Alert).where(Alert.status == "new").order_by(Alert.created_at.desc()).limit(100)
            result = await db.execute(query)
            new_alerts = result.scalars().all()
            
            if not new_alerts:
                return 0
                
            logger.info(f"[INFO] Alert Loaded: {len(new_alerts)} new alerts to analyze")
            
            processed_count = 0
            for alert in new_alerts:
                if alert.status == "new":
                    success = await self.analyze_single_alert(db, alert, rules)
                    if success:
                        processed_count += 1
                            
            return processed_count

    async def start_loop(self):
        logger.info("Starting Detection Rule Engine loop (10s interval)...")
        self.is_running = True
        while self.is_running:
            try:
                processed = await self.run_once()
                if processed > 0:
                    logger.info(f"[INFO] Processed {processed} incidents in this cycle")
            except Exception as e:
                logger.error(f"[ERROR] Engine loop error: {str(e)}")
            await asyncio.sleep(10)

detection_engine = DetectionEngine()

async def start_detection_engine():
    await detection_engine.start_loop()
