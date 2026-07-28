from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.wazuh import wazuh_service, wazuh_client
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/wazuh", tags=["Wazuh Webhook"])

@router.post("/alerts", status_code=status.HTTP_201_CREATED)
async def receive_wazuh_alert(payload: dict, db: AsyncSession = Depends(get_db)):
    result = await wazuh_service.process_wazuh_alert(db, payload)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

class ActiveResponsePayload(BaseModel):
    agent_id: str
    command: str
    arguments: List[str]

@router.post("/active-response")
async def trigger_active_response(payload: ActiveResponsePayload):
    result = await wazuh_client.trigger_active_response(
        agent_id=payload.agent_id,
        command=payload.command,
        arguments=payload.arguments
    )
    if result.get("status") != "success":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
