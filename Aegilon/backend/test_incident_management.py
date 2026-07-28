import unittest
import sys
import os
import uuid
import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
from unittest.mock import AsyncMock, MagicMock

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.incident.creator import incident_creator
from app.incident.updater import incident_updater
from app.incident.evidence import evidence_manager
from app.incident.history import history_manager

class TestIncidentManagement(unittest.TestCase):
    def test_creator_generates_correct_sequence(self):
        async def run_test():
            db_mock = AsyncMock()
            db_mock.execute.return_value.scalar = MagicMock(return_value=4)
            num = await incident_creator.generate_incident_number(db_mock)
            wib = ZoneInfo("Asia/Jakarta")
            date_str = datetime.now(wib).strftime("%Y%m%d")
            self.assertEqual(num, f"INC-{date_str}-0005")
            
        asyncio.run(run_test())

    def test_updater_increments_occurrence(self):
        async def run_test():
            db_mock = AsyncMock()
            incident_mock = MagicMock()
            incident_mock.occurrence = 2
            last_seen = datetime.now()
            
            from app.repositories.incident import incident_repo
            incident_repo.update = AsyncMock(return_value=incident_mock)
            
            await incident_updater.increment_occurrence(db_mock, incident_mock, last_seen)
            incident_repo.update.assert_called_once_with(db_mock, db_obj=incident_mock, obj_in={
                "occurrence": 3,
                "last_seen": last_seen,
                "updated_at": last_seen
            })
            
        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
