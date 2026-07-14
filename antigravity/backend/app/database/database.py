from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Adapt database connection strings to their async variants
database_url = settings.DATABASE_URL
if "YOUR_PASSWORD_HERE" in database_url or not database_url:
    database_url = "sqlite+aiosqlite:///./test.db"
    print("Database password not configured. Falling back to local SQLite database: test.db")
else:
    if database_url.startswith("sqlite://"):
        database_url = database_url.replace("sqlite://", "sqlite+aiosqlite://")
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
        
# Translate sslmode to ssl query parameter for asyncpg compatibility
    if "sslmode=" in database_url:
        database_url = database_url.split("?")[0]

connect_args = {}
if database_url.startswith("postgresql"):
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args = {
        "ssl": ctx,
        "statement_cache_size": 0
    }

# Create async engine for SQLAlchemy 2.0
engine = create_async_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
