from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.alert import alert_service
from app.schemas.alert import AlertResponse, AlertAnalysis
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(tags=["Detection Engine"])

@router.post("/analysis", response_model=AlertResponse)
async def process_analysis(
    payload: AlertAnalysis,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = await alert_service.process_analysis(
        db,
        alert_id=payload.alert_id,
        risk_score=payload.risk_score,
        severity=payload.severity,
        action=payload.action
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/detection/run")
async def run_detection_manually(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.detection import detection_engine
    try:
        processed = await detection_engine.run_once()
        return {
            "status": "success",
            "message": f"Detection engine executed successfully. Processed {processed} new alerts."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engine execution failed: {str(e)}")
