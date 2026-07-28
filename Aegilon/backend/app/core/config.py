from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Supabase credentials from .env
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: str = ""
    
    # Wazuh Integration
    WAZUH_API_URL: str = "https://localhost:55000"
    WAZUH_API_USER: str = "admin"
    WAZUH_API_PASSWORD: str = "SecretPassword"
    WAZUH_API_VERIFY_SSL: bool = False
    
    # App URL Configurations
    BACKEND_URL: str = "http://localhost:8080"
    FRONTEND_URL: str = "http://localhost:3000"

    # Telegram Notification
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Default admin seed (dev only, override via env in production)
    ADMIN_SEED_EMAIL: str = "admin@aegilon.com"
    ADMIN_SEED_PASSWORD: str = "admin123"

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
