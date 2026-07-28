from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.incident import incident_service
from app.schemas.incident import (
    IncidentResponse, 
    IncidentCreate, 
    IncidentUpdate, 
    IncidentStatusUpdate, 
    IncidentHistoryResponse, 
    IncidentAlertResponse,
    IncidentStats
)
from app.core.security import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/open", response_model=List[IncidentResponse])
async def get_open_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incidents(db, status="Open")

@router.get("/respondable", response_model=List[IncidentResponse])
async def get_respondable_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incidents(db, respondable=True)

@router.get("/stats", response_model=IncidentStats)
async def get_incident_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incident_stats(db)

@router.get("", response_model=List[IncidentResponse])
async def get_incidents(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    host_name: Optional[str] = None,
    rule_name: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    incident_number: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incidents(
        db,
        skip=skip,
        limit=limit,
        severity=severity,
        priority=priority,
        status=status,
        category=category,
        host_name=host_name,
        rule_name=rule_name,
        date_from=date_from,
        date_to=date_to,
        incident_number=incident_number
    )

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/{incident_id}/history", response_model=List[IncidentHistoryResponse])
async def get_incident_history(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incident_history(db, incident_id)

@router.get("/{incident_id}/alerts", response_model=List[IncidentAlertResponse])
async def get_incident_alerts(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await incident_service.get_incident_alerts(db, incident_id)

from fastapi import Request

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    request: Request,
    payload: IncidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.create_incident(db, payload.model_dump())
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="create_incident",
        resource=f"incident:{incident.id}",
        ip_address=request.client.host if request.client else None
    )
    return incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: UUID,
    request: Request,
    payload: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.update_incident(
        db, 
        incident_id=incident_id, 
        obj_in=payload.model_dump(exclude_unset=True),
        performed_by=current_user.email
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="update_incident",
        resource=f"incident:{incident_id}",
        ip_address=request.client.host if request.client else None
    )
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: UUID,
    request: Request,
    payload: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.update_incident_status(
        db, 
        incident_id=incident_id, 
        status=payload.status,
        performed_by=current_user.email
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="update_incident_status",
        resource=f"incident:{incident_id}",
        ip_address=request.client.host if request.client else None
    )
    return incident

@router.delete("/{incident_id}", response_model=IncidentResponse)
async def delete_incident(
    incident_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.delete_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="delete_incident",
        resource=f"incident:{incident_id}",
        ip_address=request.client.host if request.client else None
    )
    return incident

from app.schemas.incident import IncidentAnalysis

@router.post("/{incident_id}/analysis", response_model=IncidentResponse)
async def analyze_incident(
    incident_id: UUID,
    payload: IncidentAnalysis,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = await incident_service.analyze_incident(db, incident_id, payload.model_dump())
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=current_user.id,
        action="analyze_incident",
        resource=f"incident:{incident_id}",
        ip_address=request.client.host if request.client else None
    )
    return incident
