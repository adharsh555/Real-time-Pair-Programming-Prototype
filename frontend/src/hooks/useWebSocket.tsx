import { useEffect, useRef } from "react";

export default function useWebSocket(
  roomId: string | null,
  onMessage: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Always connect directly to backend running on host
    const wsUrl = `ws://localhost:8000/ws/${roomId}`;

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
  }, [roomId]);

  const send = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return { send };
}
