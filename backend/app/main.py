from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import rooms, autocomplete, ws
from .database import init_db

app = FastAPI(title="Real-time Pair Programming Prototype")

# Correct CORS origins for Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # FIXED
    allow_credentials=True,
    allow_methods=["*"],       # Allow all HTTP methods
    allow_headers=["*"],       # Allow all headers
)

# Routers
app.include_router(rooms.router)
app.include_router(autocomplete.router)
app.include_router(ws.router)

@app.on_event("startup")
async def startup():
    await init_db()     # DB wait + table creation
