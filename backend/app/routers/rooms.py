from fastapi import APIRouter
from pydantic import BaseModel
from ..services.rooms_service import create_room, get_room

router = APIRouter()

class RoomCreateResponse(BaseModel):
    roomId: str

@router.post("/rooms", response_model=RoomCreateResponse)
async def create():
    room = await create_room()
    return {"roomId": str(room.id)}

class RoomGetResponse(BaseModel):
    roomId: str
    code: str

@router.get("/rooms/{room_id}", response_model=RoomGetResponse)
async def fetch(room_id: str):
    room = await get_room(room_id)
    if not room:
        return {"roomId": room_id, "code": ""}
    return {"roomId": str(room.id), "code": room.code}
