import os
import asyncio
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./test.db"
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)


async def wait_for_db(max_retries: int = 10, delay: int = 2):
    """
    Try connecting to the DB multiple times before giving up.
    Solves the 'ConnectionRefusedError' on container startup.
    """
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[DB CHECK] Attempt {attempt}/{max_retries}...")
            async with engine.begin() as conn:
                await conn.run_sync(lambda _: None)  # small probe query
            print("[DB CHECK] Database is ready!")
            return True
        except Exception as e:
            print(f"[DB CHECK] DB not ready yet: {e}")
            await asyncio.sleep(delay)

    print("[DB CHECK] Failed to connect to DB after retries.")
    return False


async def init_db():
    # First wait until DB is ready
    await wait_for_db()

    # Now create tables safely
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
