import asyncio
import ssl
import socket

HOST = "aws-0-ap-northeast-1.pooler.supabase.com"

async def test_ports():
    for port in [5432, 6543, 443]:
        try:
            conn = await asyncio.wait_for(
                asyncio.open_connection(HOST, port),
                timeout=5
            )
            conn[1].close()
            print(f"Port {port}: OPEN")
        except asyncio.TimeoutError:
            print(f"Port {port}: TIMEOUT")
        except Exception as e:
            print(f"Port {port}: ERROR - {e}")

async def test_asyncpg_session_mode():
    """Try session mode pooler on port 5432"""
    import asyncpg
    from urllib.parse import unquote
    
    user = "postgres.eyoykqofbsrabctwfotr"
    password = unquote("saya%24kanlawan%21")  # saya$kanlawan!
    host = HOST
    database = "postgres"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    for port in [5432, 6543]:
        print(f"\nTrying asyncpg on port {port}...")
        try:
            conn = await asyncio.wait_for(
                asyncpg.connect(
                    host=host, port=port,
                    user=user, password=password,
                    database=database,
                    ssl=ctx,
                    statement_cache_size=0
                ),
                timeout=8
            )
            result = await conn.fetchval("SELECT version()")
            print(f"  SUCCESS port {port}! PostgreSQL: {result[:50]}")
            await conn.close()
            return
        except asyncio.TimeoutError:
            print(f"  TIMEOUT on port {port}")
        except Exception as e:
            print(f"  ERROR on port {port}: {type(e).__name__}: {e}")

print("=== Port scan ===")
asyncio.run(test_ports())
print("\n=== asyncpg connection test ===")
asyncio.run(test_asyncpg_session_mode())
