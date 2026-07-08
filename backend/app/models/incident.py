import uuid
from datetime import datetime
from typing import List, TYPE_CHECKING, Optional
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.alert import Alert
    from app.models.remediation import Remediation

class Incident(Base):
    __tablename__ = "incidents"

    incident_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # e.g., 'High', 'Critical'
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open") # 'open', 'contained', 'closed'
    
    # Foreign Keys
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    assignee: Mapped[Optional["User"]] = relationship(back_populates="incidents")
    alerts: Mapped[List["Alert"]] = relationship(back_populates="incident", cascade="all, delete-orphan")
    remediations: Mapped[List["Remediation"]] = relationship(back_populates="incident", cascade="all, delete-orphan")
