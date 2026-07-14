from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class RuleBase(BaseModel):
    rule_id: int
    name: str
    mitre: Optional[str] = None
    severity: str
    description: Optional[str] = None
    enabled: bool = True

class RuleResponse(RuleBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
