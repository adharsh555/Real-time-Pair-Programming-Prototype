from sqlmodel.ext.asyncio.session import AsyncSession
from ..database import engine
from ..models import Room
from uuid import UUID
from datetime import datetime

async def create_room() -> Room:
    room = Room()
    async with AsyncSession(engine) as session:
        session.add(room)
        await session.commit()
        await session.refresh(room)
    return room

async def get_room(room_id: str):
    try:
        uid = UUID(room_id)
    except:
        return None
    async with AsyncSession(engine) as session:
        room = await session.get(Room, uid)
        return room

async def update_room_code(room_id: str, code: str):
    try:
        uid = UUID(room_id)
    except:
        return None
    async with AsyncSession(engine) as session:
        room = await session.get(Room, uid)
        if not room:
            return None
        room.code = code
        room.updated_at = datetime.utcnow()
        session.add(room)
        await session.commit()
        await session.refresh(room)
        return room
