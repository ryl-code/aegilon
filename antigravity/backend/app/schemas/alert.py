from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, Any
from app.schemas.host import HostResponse
from app.schemas.rule import RuleResponse

class AlertBase(BaseModel):
    event_id: str
    host_id: UUID
    rule_id: UUID
    wazuh_level: int
    severity: str
    title: str
    description: Optional[str] = None
    raw_log: Any
    status: str = "new"

class AlertResponse(AlertBase):
    id: UUID
    created_at: datetime
    host: Optional[HostResponse] = None
    rule: Optional[RuleResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AlertAnalysis(BaseModel):
    alert_id: UUID
    risk_score: float
    severity: str
    action: Optional[str] = None
    analysis: Optional[str] = None
