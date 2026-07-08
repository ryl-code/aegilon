"""
This file exists to define the DeclarativeBase and serve as the single source of truth
for Base.metadata. By importing all models at the bottom of this file, we ensure that
when Alembic imports `Base` from here, all tables are fully registered in `Base.metadata`
without causing circular import errors during normal application runtime.
"""

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Base class for SQLAlchemy 2.0 declarative models.
    """
    pass

# Import all models only when Alembic is running to prevent circular imports during application runtime.
# This keeps Base.metadata as the single source of truth for Alembic without causing issues in FastAPI.
import sys
if "alembic" in sys.modules or any("alembic" in arg for arg in sys.argv):
    from app.models.user import User
    from app.models.security_event import SecurityEvent
    from app.models.alert import Alert
    from app.models.incident import Incident
    from app.models.remediation import Remediation
