import { useEffect, useRef } from "react";
import { API_BASE } from "../config";

export default function useWebSocket(
  roomId: string | null,
  name: string,
  onMessage: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Convert backend URL http → ws
    const wsBase = API_BASE.replace("https", "wss").replace("http", "ws");
    const wsUrl = `${wsBase}/ws/${roomId}?name=${encodeURIComponent(name)}`;

    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (e) => console.error("WebSocket error", e);

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onMessage(data);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, name]);

  const send = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return { send };
}
