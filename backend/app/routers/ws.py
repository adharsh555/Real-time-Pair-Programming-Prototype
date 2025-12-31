from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional
import json
from ..services.rooms_service import get_room, update_room_code

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}
        self.user_data: Dict[WebSocket, dict] = {} # ws -> {name, room_id}

    async def connect(self, room_id: str, websocket: WebSocket, user_name: str):
        await websocket.accept()
        self.active.setdefault(room_id, []).append(websocket)
        self.user_data[websocket] = {"name": user_name, "room_id": room_id}
        
        # Broadcast JOIN to others
        await self.broadcast(room_id, {
            "type": "presence", 
            "action": "join",
            "name": user_name,
            "users": self.get_room_users(room_id)
        })

    def get_room_users(self, room_id: str):
        return [self.user_data[ws]["name"] for ws in self.active.get(room_id, []) if ws in self.user_data]

    def disconnect(self, room_id: str, websocket: WebSocket):
        user_name = "Unknown"
        if websocket in self.user_data:
            user_name = self.user_data[websocket]["name"]
            del self.user_data[websocket]
            
        if room_id in self.active:
            if websocket in self.active[room_id]:
                self.active[room_id].remove(websocket)
            if not self.active[room_id]:
                del self.active[room_id]
        
        return user_name

    async def broadcast(self, room_id: str, message: dict, exclude: Optional[WebSocket] = None):
        for ws in self.active.get(room_id, []):
            if ws is exclude:
                continue
            try:
                await ws.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

@router.websocket("/ws/{room_id}")
async def ws_handler(websocket: WebSocket, room_id: str, name: str = "Anonymous"):
    await manager.connect(room_id, websocket, name)

    room = await get_room(room_id)
    initial_code = room.code if room else ""
    await websocket.send_text(json.dumps({
        "type": "init", 
        "code": initial_code,
        "users": manager.get_room_users(room_id)
    }))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            if payload.get("type") == "update":
                code = payload.get("code", "")
                await update_room_code(room_id, code)
                await manager.broadcast(room_id, {"type": "update", "code": code}, exclude=websocket)
            
            elif payload.get("type") == "chat":
                await manager.broadcast(room_id, {
                    "type": "chat",
                    "sender": name,
                    "text": payload.get("text", "")
                })

    except WebSocketDisconnect:
        user_name = manager.disconnect(room_id, websocket)
        await manager.broadcast(room_id, {
            "type": "presence",
            "action": "leave",
            "name": user_name,
            "users": manager.get_room_users(room_id)
        })
