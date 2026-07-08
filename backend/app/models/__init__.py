"""
This file is used for Model Discovery by SQLAlchemy and Alembic.

It explicitly imports all SQLAlchemy models so they are registered with the 
DeclarativeBase (`Base.metadata`) before Alembic attempts to autogenerate migrations.
Without this file, Alembic would not detect the tables and would generate an empty migration script.
"""

from app.models.user import User
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.remediation import Remediation

# Explicitly define the public API of this module
__all__ = [
    "User",
    "SecurityEvent",
    "Alert",
    "Incident",
    "Remediation",
]
