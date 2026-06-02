"""
WebSocket Connection Manager for real-time trip location tracking.

Usage:
    from app.services.websocket_manager import ws_manager

    # In WebSocket endpoint:
    await ws_manager.connect(trip_id, websocket)

    # In HTTP location-update endpoint:
    await ws_manager.broadcast(trip_id, {"lat": ..., "lng": ..., "ts": ...})
"""
import asyncio
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections grouped by trip_id.
    Thread-safe for asyncio (single-threaded event loop).
    """

    def __init__(self):
        # trip_id -> list[WebSocket]
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, trip_id: str, websocket: WebSocket) -> None:
        """Accept the WebSocket handshake and register the connection."""
        await websocket.accept()
        self._connections[trip_id].append(websocket)

    def disconnect(self, trip_id: str, websocket: WebSocket) -> None:
        """Remove a closed connection from the registry."""
        try:
            self._connections[trip_id].remove(websocket)
        except ValueError:
            pass  # Already removed

    async def broadcast(self, trip_id: str, data: dict) -> None:
        """
        Push a JSON payload to every admin tab currently watching this trip.
        Silently drops dead connections.
        """
        dead: list[WebSocket] = []
        for ws in list(self._connections[trip_id]):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(trip_id, ws)

    def connection_count(self, trip_id: str) -> int:
        """Return how many admin clients are watching a given trip."""
        return len(self._connections[trip_id])


# Singleton — imported everywhere that needs to broadcast or connect
ws_manager = ConnectionManager()
