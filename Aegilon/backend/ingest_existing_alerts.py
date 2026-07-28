import asyncio
import httpx
import json
import logging
import urllib.parse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.services.wazuh import wazuh_service
from app.database.database import database_url, connect_args

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Initializing connection to Supabase...")
    
    # Initialize engine
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
    
    # Query Wazuh Indexer for alerts
    indexer_url = "https://wazuh.indexer:9200/wazuh-alerts-*/_search"
    username = settings.WAZUH_API_USER
    password = settings.WAZUH_API_PASSWORD
    
    logger.info(f"Querying Wazuh Indexer at {indexer_url} with user '{username}'...")
    
    query_body = {
        "query": {
            "match_all": {}
        },
        "size": 5000, # Ingest up to 5000 existing alerts
        "sort": [{"timestamp": {"order": "desc"}}]
    }
    
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                indexer_url,
                auth=(username, password),
                json=query_body,
                headers={"Content-Type": "application/json"},
                timeout=60.0
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to query indexer: HTTP {response.status_code} - {response.text}")
                return
                
            data = response.json()
            hits = data.get("hits", {}).get("hits", [])
            logger.info(f"Found {len(hits)} alerts in Wazuh Indexer. Starting ingestion to Supabase...")
            
            success_count = 0
            for hit in hits:
                alert_json = hit.get("_source", {})
                event_id = hit.get("_id", f"gen-{asyncio.get_event_loop().time()}")
                
                # Create a fresh database session for each alert to ensure clean transaction context
                async with AsyncSessionLocal() as db:
                    try:
                        res = await wazuh_service.process_wazuh_alert(db, {
                            "_id": event_id,
                            "_source": alert_json
                        })
                        if res.get("status") in ["success", "exists"]:
                            success_count += 1
                    except Exception as ex:
                        logger.warning(f"Error processing alert {event_id}: {str(ex)}")
                        
            logger.info(f"Successfully ingested/verified {success_count} / {len(hits)} alerts to Supabase PostgreSQL!")
            
    except Exception as e:
        logger.error(f"Error querying Wazuh indexer: {str(e)}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
