import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

if TYPE_CHECKING:
    from app.models.alert import Alert

class SecurityEvent(Base):
    __tablename__ = "security_events"

    event_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    layer: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., 'host', 'network', 'application'
    source: Mapped[str] = mapped_column(String(50), nullable=False) # e.g., 'osquery', 'wazuh', 'backend'
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    host_ip: Mapped[str] = mapped_column(String(50), nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # e.g., 'Low', 'Medium', 'High', 'Critical'
    
    # Store the raw payload/JSON string for potential forensic analysis or threat hunting
    raw_log: Mapped[str] = mapped_column(Text, nullable=False)
