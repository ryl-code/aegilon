import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

# TYPE_CHECKING helps prevent circular imports during runtime
if TYPE_CHECKING:
    from app.models.security_event import SecurityEvent
    from app.models.incident import Incident

class Alert(Base):
    __tablename__ = "alerts"

    alert_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    event_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("security_events.event_id"), nullable=False, unique=True)
    incident_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("incidents.incident_id"), nullable=True, index=True)
    
    # Alert Data
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    layer: Mapped[str] = mapped_column(String(50), nullable=False)
    detection_name: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # 'Low', 'Medium', 'High', 'Critical'
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open") # 'open', 'investigating', 'resolved'
    mitre_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # e.g., 'T1046', 'T1059' (optional mapping)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    security_event: Mapped["SecurityEvent"] = relationship(back_populates="alert")
    incident: Mapped[Optional["Incident"]] = relationship(back_populates="alerts")
