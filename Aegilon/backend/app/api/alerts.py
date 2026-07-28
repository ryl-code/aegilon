from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.alert import alert_service
from app.schemas.alert import AlertResponse
from app.core.security import get_current_user
from app.models.user import User
from typing import List
from uuid import UUID

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    skip: int = 0,
    limit: int = 100,
    severity: str = None,
    minutes: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await alert_service.get_alerts(db, skip=skip, limit=limit, severity=severity, minutes=minutes)

@router.get("/unprocessed", response_model=List[AlertResponse])
async def get_unprocessed(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await alert_service.get_unprocessed(db, skip=skip, limit=limit)

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = await alert_service.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
