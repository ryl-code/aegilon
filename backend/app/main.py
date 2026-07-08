"""
This file is the main entry point for the FastAPI application.
It exists to initialize the FastAPI instance, configure CORS, and include all API routers.
It glues everything together so the web server (e.g., Uvicorn) can run the application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def create_app() -> FastAPI:
    """
    Application factory pattern to create and configure the FastAPI instance.
    This pattern makes testing easier and keeps initialization logic organized and modular.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="Aegilon XDR Backend API",
    )

    # Configure CORS (Cross-Origin Resource Sharing)
    # This allows the Next.js frontend to securely communicate with the FastAPI backend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In production, restrict this to the specific frontend URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API v1 routers
    from app.api.v1.auth import router as auth_router
    app.include_router(auth_router, prefix=settings.API_V1_STR)
    
    @app.get("/health")
    async def health_check():
        """
        Health check endpoint.
        Useful for orchestration tools (like Docker/Kubernetes) to verify that the API is running.
        """
        return {"status": "ok", "service": settings.PROJECT_NAME}

    return app

# The main application instance to be run by the ASGI server
app = create_app()
