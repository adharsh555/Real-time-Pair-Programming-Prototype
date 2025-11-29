import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import Editor from "./components/Editor";
import { API_BASE } from "./config";

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinId, setJoinId] = useState("");

  // Detect /room/:id on page load
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    if (parts[1] === "room" && parts[2]) setRoomId(parts[2]);
  }, []);

  // Create new room
  const createRoom = async () => {
    const res = await fetch(`${API_BASE}/rooms`, { method: "POST" });
    const json = await res.json();
    const id = json.roomId;

    window.history.pushState({}, "", `/room/${id}`);
    setRoomId(id);
  };

  // Join existing room
  const joinRoom = () => {
    if (!joinId.trim()) return;
    window.history.pushState({}, "", `/room/${joinId}`);
    setRoomId(joinId);
  };

  return (
    <Provider store={store}>
      <div style={{ maxWidth: "700px", margin: "50px auto", padding: "20px" }}>
        {!roomId ? (
          <>
            <h1>Pair Programming Prototype</h1>

            <button onClick={createRoom}>Create New Room</button>

            <div style={{ marginTop: "25px" }}>
              <input
                placeholder="Enter Room ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                style={{
                  padding: "8px",
                  width: "220px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={joinRoom}
                style={{ marginLeft: "10px" }}
              >
                Join Room
              </button>
            </div>
          </>
        ) : (
          <Editor roomId={roomId} />
        )}
      </div>
    </Provider>
  );
}
