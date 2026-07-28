from app.repositories.base import BaseRepository
from app.models.incident_history import IncidentHistory

class IncidentHistoryRepository(BaseRepository[IncidentHistory]):
    def __init__(self):
        super().__init__(IncidentHistory)

incident_history_repo = IncidentHistoryRepository()
