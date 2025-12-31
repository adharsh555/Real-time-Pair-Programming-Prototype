import React, { useEffect, useState, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { setCode } from "../features/room/roomSlice";
import { API_BASE } from "../config";
import {
  Copy,
  Check,
  Share2,
  Users,
  Terminal,
  Zap,
  ShieldCheck,
  Code2,
  Info
} from "lucide-react";

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 600) {
  let t: any = null;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Helper for random names
const RANDOM_NAMES = ["Space-Cowboy", "Code-Ninja", "Byte-Wizard", "Logic-Lord", "Pixel-Pilot", "Data-Druid"];
const getRandomName = () => RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + "-" + Math.floor(Math.random() * 999);

export default function Editor({ roomId }: { roomId: string }) {
  const dispatch = useAppDispatch();
  const globalCode = useAppSelector((s) => s.room.code);
  const [local, setLocal] = useState(globalCode);
  const [copied, setCopied] = useState(false);

  // Presence & Chat State
  const [userName] = useState(() => sessionStorage.getItem("sync_name") || getRandomName());
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  const suggestion = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync external changes from websocket
  useEffect(() => setLocal(globalCode), [globalCode]);

  useEffect(() => {
    sessionStorage.setItem("sync_name", userName);
  }, [userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When websocket receives update
  const onMessage = (msg: any) => {
    if (msg.type === "init") {
      dispatch(setCode(msg.code));
      setUsers(msg.users || []);
    } else if (msg.type === "update") {
      dispatch(setCode(msg.code));
    } else if (msg.type === "presence") {
      setUsers(msg.users || []);
    } else if (msg.type === "chat") {
      setMessages(prev => [...prev, { sender: msg.sender, text: msg.text }]);
    }
  };

  const { send } = useWebSocket(roomId, userName, onMessage);

  // Call autocomplete API
  const callAutocomplete = async (code: string, cursor: number) => {
    const res = await fetch(`${API_BASE}/autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        cursorPosition: cursor,
        language: "python",
      }),
    });

    const json = await res.json();
    suggestion.current = json.suggestion;
  };

  // Debounce autocomplete
  const debouncedAutocomplete = useRef(
    debounce((code, cursor) => callAutocomplete(code, cursor), 600)
  ).current;

  // When typing
  const change = (e: any) => {
    const v = e.target.value;
    setLocal(v);
    dispatch(setCode(v));

    send({ type: "update", code: v });

    debouncedAutocomplete(v, v.length);
  };

  // Accept suggestion
  const acceptSuggestion = () => {
    if (suggestion.current) {
      const newCode = local + suggestion.current;
      setLocal(newCode);
      dispatch(setCode(newCode));
      send({ type: "update", code: newCode });
      suggestion.current = null;
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    send({ type: "chat", text: chatInput });
    setChatInput("");
  };

  const handleExit = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen w-full bg-bg-main text-text-primary overflow-hidden relative">
      {/* Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExitModal(false)}></div>
          <div className="glass p-8 rounded-2xl shadow-2xl max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 glass">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">End Session?</h3>
            <p className="text-slate-400 text-center text-sm mb-8">
              Are you sure you want to end this pairing session? This will return you to the landing page.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowExitModal(false)}
                className="btn-secondary justify-center py-3"
              >
                No, Stay
              </button>
              <button
                onClick={handleExit}
                className="btn-primary bg-rose-600 hover:bg-rose-500 justify-center py-3 border-none"
              >
                Yes, End
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-80 glass-dark border-r border-border-color flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-border-color flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center glass">
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">SyncCode</h2>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Session
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {/* Session Info */}
          <section>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={14} /> Session Info
            </h3>
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-color space-y-3">
              <div>
                <label className="text-[10px] text-text-muted uppercase font-bold">Your Identity</label>
                <div className="text-sm font-medium text-indigo-400 mt-0.5">{userName}</div>
              </div>
              <div className="pt-2 border-t border-border-color/50">
                <label className="text-[10px] text-text-muted uppercase font-bold">Room ID</label>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <code className="text-slate-400 font-mono text-xs truncate">{roomId}</code>
                  <button
                    onClick={copyRoomId}
                    className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted hover:text-white"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Collaborators */}
          <section>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={14} /> Collaborators ({users.length})
            </h3>
            <div className="space-y-3">
              {users.map((name, i) => (
                <div key={i} className="flex items-center gap-3 group animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${name === userName ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                    {name.split("-").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{name === userName ? 'You' : name}</p>
                    <p className="text-[10px] text-text-muted">{name === userName ? 'Host' : 'Editor'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chat Section */}
          <section className="flex flex-col h-72 border-t border-border-color pt-6">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Terminal size={14} /> Session Chat
            </h3>
            <div className="flex-1 bg-bg-secondary/30 rounded-xl border border-border-color overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                {messages.length === 0 && (
                  <div className="text-text-muted italic text-center py-4">No messages yet...</div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === userName ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-text-muted mb-0.5">{m.sender === userName ? 'Me' : m.sender}</span>
                    <div className={`px-2 py-1.5 rounded-lg max-w-[90%] break-words ${m.sender === userName ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-bg-tertiary text-text-primary rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendChat} className="p-2 border-t border-border-color bg-bg-secondary/50">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent text-xs outline-none py-1 placeholder-text-muted"
                />
              </form>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border-color">
          <button
            onClick={() => setShowExitModal(true)}
            className="btn-secondary w-full justify-center text-xs py-2 opacity-50 hover:opacity-100 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all duration-300"
          >
            <ShieldCheck size={14} /> End Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border-color glass flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded-lg border border-border-color">
              <Terminal size={16} className="text-text-muted" />
              <span className="text-sm font-medium">main.py</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyRoomId}
              className="btn-secondary py-1.5 px-3 text-sm"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              {copied ? 'Copied' : 'Invite'}
            </button>
            <div className="w-px h-6 bg-border-color mx-1"></div>
            <div className="flex -space-x-2">
              {users.slice(0, 3).map((name, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-bg-main flex items-center justify-center text-[10px] font-bold ${name === userName ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                  {name.split("-").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              ))}
              {users.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-bg-main bg-bg-tertiary flex items-center justify-center text-[10px] font-bold">
                  +{users.length - 3}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0f1d]">
          {/* Editor background decoration */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full"></div>
          </div>

          {/* Line Numbers Simulation */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-bg-secondary/30 border-r border-border-color flex flex-col items-center pt-6 z-0 select-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="text-[10px] text-slate-600 font-mono leading-[1.5rem] h-6">
                {i + 1}
              </div>
            ))}
          </div>

          <textarea
            value={local}
            onChange={change}
            spellCheck={false}
            className="w-full h-full relative z-1 p-6 pl-14 bg-transparent text-indigo-100 font-mono text-[15px] resize-none outline-none leading-6 placeholder-slate-700"
            placeholder="// Start coding together..."
          />

          {/* AI Suggestion Bar */}
          {suggestion.current && (
            <div className="absolute bottom-8 right-8 z-20 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="glass p-1 rounded-xl shadow-2xl flex items-center gap-2 pr-4 border border-indigo-500/30">
                <div className="bg-indigo-500 text-white p-3 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                  <Zap size={18} />
                  <span className="font-bold text-sm tracking-tight">AI SUGGESTION</span>
                </div>
                <div className="px-2">
                  <code className="text-text-primary text-sm font-mono bg-bg-secondary px-2 py-1 rounded border border-border-color">
                    {suggestion.current}
                  </code>
                </div>
                <button
                  onClick={acceptSuggestion}
                  className="btn-primary py-2 px-4 text-xs font-bold rounded-lg"
                >
                  TAB TO ACCEPT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="h-8 border-t border-border-color bg-bg-secondary/50 px-4 flex items-center justify-between text-[10px] text-text-muted font-medium uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
            </span>
            <span>Python 3.10</span>
          </div>
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span className="text-indigo-400">Syncing...</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
