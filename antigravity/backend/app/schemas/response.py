from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class ResponseBase(BaseModel):
    incident_id: UUID
    action: str
    status: str = "pending"
    message: Optional[str] = None

class ResponseResponse(ResponseBase):
    id: UUID
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)
