from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional

class HostBase(BaseModel):
    hostname: str
    agent_id: str
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    status: str = "active"

    @field_validator("ip_address", mode="before")
    @classmethod
    def serialize_ip(cls, v):
        if v is not None and not isinstance(v, str):
            return str(v)
        return v

class HostResponse(HostBase):
    id: UUID
    last_seen: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
