from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.response import response_service
from app.schemas.response import ResponseResponse, ResponseBase
from app.core.security import get_current_user
from app.models.user import User
from typing import List
from uuid import UUID

router = APIRouter(prefix="/responses", tags=["Responses"])

@router.get("", response_model=List[ResponseResponse])
async def get_responses(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await response_service.get_responses(db, skip=skip, limit=limit)

@router.get("/{response_id}", response_model=ResponseResponse)
async def get_response(
    response_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await response_service.get_response(db, response_id)
    if not res:
        raise HTTPException(status_code=404, detail="Response action history not found")
    return res

from fastapi import Request

@router.put("/{response_id}", response_model=ResponseResponse)
async def update_response_status(
    response_id: UUID,
    request: Request,
    payload: ResponseBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await response_service.update_response_status(
        db,
        response_id=response_id,
        status=payload.status,
        message=payload.message
    )
    if not res:
        raise HTTPException(status_code=404, detail="Response action history not found")
        
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="update_response_status",
        resource=f"response:{response_id}",
        ip_address=request.client.host if request.client else None
    )
    return res

@router.post("", response_model=ResponseResponse, status_code=201)
async def create_response(
    request: Request,
    payload: ResponseBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await response_service.create_response(db, payload.model_dump())
    
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="create_response",
        resource=f"response:{res.id}",
        ip_address=request.client.host if request.client else None
    )
    return res
