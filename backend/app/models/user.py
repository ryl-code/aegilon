import uuid
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
    from app.models.incident import Incident

class User(Base):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False) # e.g., 'admin' or 'analyst'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Use timezone-aware timestamps with database-generated defaults
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to Incident (One-to-Many: One user can be assigned multiple incidents)
    incidents: Mapped[List["Incident"]] = relationship(back_populates="assignee")
