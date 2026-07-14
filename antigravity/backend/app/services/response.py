from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import response_repo
from app.models.response import Response
from typing import List, Optional
from uuid import UUID

class ResponseService:
    async def get_responses(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Response]:
        return await response_repo.get_multi(db, skip=skip, limit=limit)

    async def get_response(self, db: AsyncSession, response_id: UUID) -> Optional[Response]:
        return await response_repo.get(db, response_id)

    async def update_response_status(self, db: AsyncSession, response_id: UUID, status: str, message: str = None) -> Optional[Response]:
        res = await response_repo.get(db, response_id)
        if not res:
            return None
        updates = {"status": status}
        if message:
            updates["message"] = message
        from datetime import datetime
        updates["executed_at"] = datetime.now()
        return await response_repo.update(db, db_obj=res, obj_in=updates)

    async def create_response(self, db: AsyncSession, obj_in: dict) -> Response:
        from datetime import datetime
        from zoneinfo import ZoneInfo
        wib = ZoneInfo("Asia/Jakarta")
        obj_in["executed_at"] = datetime.now(wib)
        return await response_repo.create(db, obj_in=obj_in)

response_service = ResponseService()
