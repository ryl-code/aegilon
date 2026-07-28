import asyncio
import time
from app.database.database import AsyncSessionLocal
from app.repositories import alert_repo

async def check():
    start = time.time()
    async with AsyncSessionLocal() as db:
        res = await alert_repo.get_unprocessed(db, skip=0, limit=100)
        print(f"Fetched {len(res)} alerts in {time.time() - start:.3f} seconds.")

if __name__ == "__main__":
    asyncio.run(check())
