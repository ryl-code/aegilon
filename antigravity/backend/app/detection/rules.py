from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.rule import Rule
import json
import logging

logger = logging.getLogger("aegilon-detection-engine")

class RulesLoader:
    @staticmethod
    async def load_rules(db: AsyncSession):
        query = select(Rule).where(Rule.enabled == True)
        result = await db.execute(query)
        db_rules = result.scalars().all()
        
        parsed_rules = []
        for r in db_rules:
            conditions = {}
            try:
                if r.description and r.description.strip().startswith("{") and r.description.strip().endswith("}"):
                    conditions = json.loads(r.description)
            except Exception as e:
                logger.debug(f"Rule description is not JSON for rule {r.name}: {str(e)}")
                
            parsed_rules.append({
                "db_rule": r,
                "rule_id": r.rule_id,
                "name": r.name,
                "mitre": r.mitre,
                "severity": r.severity,
                "conditions": conditions
            })
        return parsed_rules

rules_loader = RulesLoader()
