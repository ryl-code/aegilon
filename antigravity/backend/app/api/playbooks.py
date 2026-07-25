from fastapi import APIRouter, Depends
from app.services.soar_playbook import PLAYBOOKS
from app.core.security import get_current_user
from app.models.user import User
from typing import List, Dict, Any

router = APIRouter(prefix="/playbooks", tags=["SOAR Playbooks"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_playbooks(
    current_user: User = Depends(get_current_user)
):
    return [
        {
            "id": pb["id"],
            "name": pb["name"],
            "actions": pb["actions"],
            "description": pb["description"],
            "enabled": True
        }
        for pb in PLAYBOOKS
    ]
