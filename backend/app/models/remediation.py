import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.incident import Incident

class Remediation(Base):
    __tablename__ = "remediations"

    remediation_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    incident_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("incidents.incident_id"), nullable=False, index=True)
    
    # Action details based on API Contract
    action: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'block_ip', 'isolate_container'
    target: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # e.g., 'High', 'Critical'
    
    # Execution Tracking
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending") # 'pending', 'success', 'failed'
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # These fields are populated by the OpenClaw callback after execution
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Standard Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    incident: Mapped["Incident"] = relationship(back_populates="remediations")
