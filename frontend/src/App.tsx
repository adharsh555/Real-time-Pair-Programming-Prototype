import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import Editor from "./components/Editor";
import { API_BASE } from "./config";
import { Plus, Users, Code2, Sparkles } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center p-6 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full py-12">
          {!roomId ? (
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Logo & Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 glass">
                  <Code2 size={32} />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                  SyncCode
                </h1>
                <p className="text-slate-400">
                  Real-time pair programming for elite teams.
                </p>
              </div>

              {/* Actions Card */}
              <div className="glass p-8 rounded-2xl shadow-2xl space-y-8">
                <div>
                  <button
                    onClick={createRoom}
                    className="btn-primary w-full justify-center text-lg py-4"
                  >
                    <Plus size={20} />
                    Create New Room
                  </button>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                      OR
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Users size={18} />
                    </div>
                    <input
                      placeholder="Enter Secret Room ID"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      className="input-main pl-10 py-3"
                    />
                  </div>
                  <button
                    onClick={joinRoom}
                    disabled={!joinId.trim()}
                    className="btn-secondary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Existing Session
                  </button>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-12 flex items-center justify-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>Real-time Sync</span>
                </div>
              </div>
            </div>
          ) : (
            <Editor roomId={roomId} />
          )}
        </div>
      </div>
    </Provider>
  );
}
