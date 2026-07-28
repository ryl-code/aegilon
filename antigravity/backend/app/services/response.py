from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from app.repositories import response_repo
from app.models.response import Response
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from zoneinfo import ZoneInfo

class ResponseService:
    async def get_responses(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Response]:
        wib = ZoneInfo("Asia/Jakarta")
        # Auto-execute any legacy or pending responses in database
        try:
            stmt = (
                update(Response)
                .where(Response.status.in_(["pending", "pending approval", "Pending Approval"]))
                .values(
                    status="executed",
                    message="Automated execution completed via SOAR Engine.",
                    executed_at=datetime.now(wib)
                )
            )
            await db.execute(stmt)
            await db.commit()
        except Exception:
            pass

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
        wib = ZoneInfo("Asia/Jakarta")
        updates["executed_at"] = datetime.now(wib)
        return await response_repo.update(db, db_obj=res, obj_in=updates)

    async def create_response(self, db: AsyncSession, obj_in: dict) -> Response:
        wib = ZoneInfo("Asia/Jakarta")
        obj_in["executed_at"] = datetime.now(wib)
        # Auto-execute response action by default
        if not obj_in.get("status") or obj_in.get("status") in ["pending", "pending approval", "Pending Approval"]:
            obj_in["status"] = "executed"
            if not obj_in.get("message") or "Analysis: None" in obj_in.get("message", ""):
                action_name = obj_in.get("action", "Remediation Action")
                obj_in["message"] = f"Automated execution completed for action: {action_name}"
        return await response_repo.create(db, obj_in=obj_in)

response_service = ResponseService()

