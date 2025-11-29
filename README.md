# Real-Time Pair Programming Prototype  
### Built by [Adharsh P Ajayakumar](https://github.com/adharsh555)

A full-stack, real-time collaborative coding platform where users can create or join shared rooms, type together live, and receive AI-style autocomplete suggestions (mocked).  
This project was built as part of the **Build Prototype – FULL-STACK Python API Developer** challenge.

---

## Live Demo

**Frontend:**  
https://live-pair-program.up.railway.app  

**Backend (Swagger Docs):**  
https://real-time-pair-programming-prototype-production-6e29.up.railway.app/docs

---

# Overview

This prototype simulates a real-time pair-programming environment where:

- Two (or more) users join the same room  
- Code together simultaneously  
- See updates instantly through WebSockets  
- Receive AI-like autocomplete suggestions when they pause typing  

The aim is to demonstrate skill with **FastAPI**, **WebSockets**, **React + TypeScript**, and **state synchronization** in a real-time system.

---

# Core Features

### Room Creation & Joining
- One-click room creation  
- Sharable room ID (copy button included)  
- Join via URL pattern:  
  ```
  /room/<roomId>
  ```
- No login/authentication required  

### Real-Time Collaborative Coding (WebSockets)
- Backed by FastAPI WebSockets  
- Instant sync between two or more users  
- “Last-write wins” strategy  
- In-memory + Postgres-backed room state  

### AI Autocomplete (Mocked)
- Triggered 600ms after user stops typing  
- Backend returns a simple rule-based suggestion  
- “Accept Suggestion” button inserts the suggestion into the editor  

### Persistent Room State
- Room code stored in PostgreSQL  
- Users joining a room get the latest synced version  

---

# Tech Stack

### Backend
- Python 3.11  
- FastAPI  
- WebSockets  
- Postgres  
- SQLAlchemy  
- Uvicorn  
- Railway Deployment  

### Frontend
- React  
- TypeScript  
- Redux Toolkit  
- Vite  
- Custom WebSocket client  
- Railway Deployment  

---

# Project Structure

```
repo-root/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── rooms.py
│   │   │   ├── autocomplete.py
│   │   │   ├── ws.py
│   │   ├── database.py
│   │   ├── models.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/RoomPage.tsx
│   │   ├── components/Editor.tsx
│   │   ├── hooks/useWebSocket.tsx
│   │   ├── features/roomSlice.ts
│   │   ├── config.ts
│   ├── Procfile
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

#  How to Use the Application (User Guide)

### 1. Open the App
Navigate to:  
https://live-pair-program.up.railway.app

### 2. Create a Room
- Click **Create Room**
- A unique Room ID appears at the top
- Click **Copy** to copy Room ID

### 3. Join a Room
Users can join by entering the Room ID  
OR directly via:

```
https://live-pair-program.up.railway.app/room/<roomId>
```

### 4. Live Collaboration
- All users in the room type together  
- Every keystroke syncs instantly  

### 5. Autocomplete
- Pause typing → suggestion appears  
- Click **Accept Suggestion** to insert  

---

# Running Locally

## Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend available at:  
```
http://localhost:8000
```

Swagger docs:  
```
http://localhost:8000/docs
```

---

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at:  
```
http://localhost:5173
```

---

# API Endpoints

### POST `/rooms`
Returns a new room ID.

Response:
```json
{ "roomId": "abc123" }
```

---

### POST `/autocomplete`
Request:
```json
{
  "code": "print('hi')",
  "cursorPosition": 10,
  "language": "python"
}
```

Response (mocked):
```json
{ "suggestion": "print('hello world')" }
```

---

### WebSocket `/ws/<roomId>`
Handles:
- Broadcasting updates to all clients  
- Initial sync  
- Real-time content sharing  

---

# Architecture & Design Decisions

### ✔ FastAPI for async performance  
Handles WebSockets natively with excellent performance.

### ✔ Redux Toolkit for global state  
Makes syncing and updates predictable.

### ✔ Vite for fast frontend build  
Quick HMR + small bundles.

### ✔ Room state stored in DB  
Improves resilience compared to pure in-memory solutions.

### ✔ Clean backend structure  
Routers separated for maintainability:
- `rooms.py`
- `autocomplete.py`
- `ws.py`

---

# What Could Be Improved With More Time

### Feature Enhancements
- Multi-user cursor indicators  
- Real-time cursor position syncing  
- Monaco/CodeMirror editor  
- Room history + playback  

### Technical Improvements
- Authentication  
- Better diff-based sync  
- Real AI autocomplete (OpenAI/Anthropic)  
- WebSocket reconnection logic  
- Automated tests  

### UI Enhancements
- Dark/light mode  
- Better layout  
- User presence indicators  

---

# Challenge Evaluation Criteria Mapping

| Requirement | Status |
|------------|--------|
| Room creation & joining | ✅ Done |
| Real-time WebSocket collaboration | ✅ Implemented |
| Mock AI autocomplete | ✅ Implemented |
| REST API design | ✅ Clean & modular |
| FastAPI structure | ✅ Good architecture |
| Redux + TS frontend | ✅ Implemented |
| README quality | ✅ Professional & complete |
| Optional deployment | ✅ Live demo running |

---

# Author  
**Adharsh P Ajayakumar**  
GitHub: https://github.com/adharsh555
email: adharshajay55@gmail.com
