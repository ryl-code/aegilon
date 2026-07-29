from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, List, Dict, Any
from app.schemas.alert import AlertResponse
from app.schemas.host import HostResponse
from app.schemas.rule import RuleResponse

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    rule_id: UUID
    host_id: UUID
    severity: str
    priority: str = "Low"
    category: str
    confidence: int = 70

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: str

class IncidentAnalysis(BaseModel):
    risk_score: float
    severity: str
    recommended_action: str
    confidence: float
    analysis: str

class IncidentAlertResponse(BaseModel):
    id: UUID
    incident_id: UUID
    alert_id: UUID
    created_at: datetime
    alert: Optional[AlertResponse] = None

    model_config = ConfigDict(from_attributes=True)

class IncidentHistoryResponse(BaseModel):
    id: UUID
    incident_id: UUID
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    performed_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentResponse(IncidentBase):
    id: UUID
    incident_number: str
    status: str
    occurrence: int
    risk_score: Optional[float] = None
    first_seen: datetime
    last_seen: datetime
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    
    host: Optional[HostResponse] = None
    rule: Optional[RuleResponse] = None

    model_config = ConfigDict(from_attributes=True)

class IncidentStats(BaseModel):
    total_incidents: int
    open_incidents: int
    critical_incidents: int
    resolved_incidents: int
    severity_counts: Dict[str, int]
    status_counts: Dict[str, int]
    category_counts: Dict[str, int]
    top_affected_hosts: List[Dict[str, Any]]
    most_triggered_rules: List[Dict[str, Any]]
    total_hosts: int
    active_alerts: int
    trend_data: Optional[Dict[str, Any]] = None
    database_bytes: Optional[int] = None
    database_size_mb: Optional[float] = None
    sla_compliance_pct: Optional[float] = None
