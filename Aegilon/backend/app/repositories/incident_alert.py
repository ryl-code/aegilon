from app.repositories.base import BaseRepository
from app.models.incident_alert import IncidentAlert

class IncidentAlertRepository(BaseRepository[IncidentAlert]):
    def __init__(self):
        super().__init__(IncidentAlert)

incident_alert_repo = IncidentAlertRepository()
