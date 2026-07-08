"""
This file exists to handle the application's configuration and environment variables.
Using Pydantic's BaseSettings allows us to validate settings on startup and have
type-hinted access to them throughout the application. It acts as a single source of truth for config.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Aegilon XDR"
    
    # PostgreSQL Database settings
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    
    # Security settings
    SECRET_KEY: str = "secret" # Replace with a strong key in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Construct PostgreSQL URI string for SQLAlchemy 2.0 with asyncpg driver
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Model configuration for pydantic_settings to read from .env file
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
