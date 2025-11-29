from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional
import json
from ..services.rooms_service import get_room, update_room_code

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(room_id, []).append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active:
            if websocket in self.active[room_id]:
                self.active[room_id].remove(websocket)
            if not self.active[room_id]:
                del self.active[room_id]

    async def broadcast(self, room_id: str, message: dict, exclude: Optional[WebSocket] = None):
        for ws in self.active.get(room_id, []):
            if ws is exclude:
                continue
            await ws.send_text(json.dumps(message))

manager = ConnectionManager()

@router.websocket("/ws/{room_id}")
async def ws_handler(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)

    room = await get_room(room_id)
    initial_code = room.code if room else ""
    await websocket.send_text(json.dumps({"type": "init", "code": initial_code}))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            if payload.get("type") == "update":
                code = payload.get("code", "")
                await update_room_code(room_id, code)
                await manager.broadcast(room_id, {"type": "update", "code": code}, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
