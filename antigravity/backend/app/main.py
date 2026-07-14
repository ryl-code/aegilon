from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from app.api import health, auth, hosts, alerts, analysis, incidents, responses, wazuh, audit_logs, notifications
from app.database.database import engine, Base, AsyncSessionLocal
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash
from app.services.wazuh import start_wazuh_sync
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Seed default admin user if database is empty (safe insert check)
    async with AsyncSessionLocal() as db:
        try:
            from sqlalchemy import select
            query = select(User)
            result = await db.execute(query)
            users = result.scalars().all()
            if len(users) == 0:
                admin_user = User(
                    name="Admin",
                    email=settings.ADMIN_SEED_EMAIL,
                    password_hash=get_password_hash(settings.ADMIN_SEED_PASSWORD),
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                print(f"Pre-seeded default admin user: {settings.ADMIN_SEED_EMAIL} (set ADMIN_SEED_PASSWORD in .env)")
        except Exception as e:
            print(f"Admin seeding check skipped: {str(e)}")
            
    # 2. Start background Wazuh Sync task
    sync_task = asyncio.create_task(start_wazuh_sync())
    
    yield
    
    # 3. Cleanup background tasks on shutdown
    sync_task.cancel()
    try:
        await asyncio.gather(sync_task, return_exceptions=True)
    except Exception:
        pass

app = FastAPI(
    title="AEGILON Backend API",
    description="Low-Overhead Extended Detection & Response (XDR) Backend",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"] if settings.FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gzip compression for low-bandwidth environments
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Register endpoints
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(hosts.router)
app.include_router(alerts.router)
app.include_router(analysis.router)
app.include_router(incidents.router)
app.include_router(incidents.router, prefix="/api")
app.include_router(responses.router)
app.include_router(responses.router, prefix="/api")
app.include_router(wazuh.router)
app.include_router(wazuh.router, prefix="/api")
app.include_router(audit_logs.router)
app.include_router(notifications.router)
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AEGILON XDR Backend API. Visit /docs for OpenAPI documentation."
    }
