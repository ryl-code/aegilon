from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class SecurityEventBase(BaseModel):
    timestamp: datetime
    layer: str # 'host', 'network', 'application'
    source: str # 'osquery', 'wazuh', 'backend'
    event_type: str
    host: str
    host_ip: Optional[str] = None
    severity: Optional[str] = None
    raw_log: str

class SecurityEventResponse(SecurityEventBase):
    event_id: UUID

    model_config = ConfigDict(from_attributes=True)
