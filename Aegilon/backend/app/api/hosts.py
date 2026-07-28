from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.host import host_service
from app.schemas.host import HostResponse
from app.core.security import get_current_user
from app.models.user import User
from typing import List
from uuid import UUID

router = APIRouter(prefix="/hosts", tags=["Hosts"])

@router.get("", response_model=List[HostResponse])
async def get_hosts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await host_service.get_hosts(db, skip=skip, limit=limit)

@router.get("/{host_id}", response_model=HostResponse)
async def get_host(
    host_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    host = await host_service.get_host(db, host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    return host
