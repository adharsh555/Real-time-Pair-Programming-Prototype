import React, { useEffect, useState, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { setCode } from "../features/room/roomSlice";
import { API_BASE } from "../config";

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 600) {
  let t: any = null;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function Editor({ roomId }: { roomId: string }) {
  const dispatch = useAppDispatch();
  const globalCode = useAppSelector((s) => s.room.code);
  const [local, setLocal] = useState(globalCode);
  const suggestion = useRef<string | null>(null);

  // Sync external changes from websocket
  useEffect(() => setLocal(globalCode), [globalCode]);

  // When websocket receives update
  const onMessage = (msg: any) => {
    if (msg.type === "init" || msg.type === "update") {
      dispatch(setCode(msg.code));
    }
  };

  const { send } = useWebSocket(roomId, onMessage);

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

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto" }}>
      {/* Suggestion button */}
      <div style={{ marginBottom: "10px" }}>
        <button
          disabled={!suggestion.current}
          onClick={acceptSuggestion}
          style={{ opacity: suggestion.current ? 1 : 0.5 }}
        >
          Accept Suggestion
        </button>

        {suggestion.current && (
          <span style={{ marginLeft: "12px", fontSize: "14px", color: "#555" }}>
            Suggested: <code>{suggestion.current}</code>
          </span>
        )}
      </div>

      {/* Main Editor */}
      <textarea
        value={local}
        onChange={change}
        style={{
          width: "100%",
          height: "75vh",
          padding: "12px",
          fontFamily: "Consolas, monospace",
          fontSize: "15px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          resize: "none",
          outline: "none",
          background: "#fafafa",
          lineHeight: "1.5",
        }}
      />
    </div>
  );
}
