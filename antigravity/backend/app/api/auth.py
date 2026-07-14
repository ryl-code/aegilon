from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.core import security
from app.schemas.user import UserResponse, Token
from app.models.user import User
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])

from fastapi import Request

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where((User.email == form_data.username) | (User.name == form_data.username))
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/name or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": user.email})
    
    # Log successful login to audit logs
    from app.services.audit_log import audit_log_service
    await audit_log_service.log_action(
        db,
        user_id=user.id,
        action="user_login",
        resource="auth",
        ip_address=request.client.host if request.client else None
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(security.get_current_user)):
    return current_user
