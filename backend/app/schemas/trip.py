"""
Pydantic schemas for Trip request/response bodies.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ──────────────────────────────────────────────────────────────────────────────
# Request schemas
# ──────────────────────────────────────────────────────────────────────────────

class TripCreateRequest(BaseModel):
    """Body for POST /api/trips/ — owner creates a new trip/booking."""
    vehicle_id: str  
    trip_id: str                       # Which vehicle is being assigned
    client_name: str
    client_phone: str                       # Used to send booking SMS
    pickup_location: str
    drop_location: str
    reporting_time: datetime               # ISO 8601 datetime e.g. "2026-05-26T08:00:00"
    balance_amount: float = 0.0
    notes: Optional[str] = None


class TripUpdateRequest(BaseModel):
    """Body for PUT /api/trips/{id} — all fields optional."""
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    pickup_location: Optional[str] = None
    drop_location: Optional[str] = None
    reporting_time: Optional[datetime] = None
    balance_amount: Optional[float] = None
    payment_status: Optional[str] = None   # "Pending" | "Paid"
    trip_status: Optional[str] = None      # "Scheduled" | "On Trip" | "Completed" | "Cancelled"
    notes: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# Response schema
# ──────────────────────────────────────────────────────────────────────────────

class TripResponse(BaseModel):
    """Safe trip representation returned to the client."""
    id: str
    trip_id: str
    vehicle_id: str
    vehicle_number: str
    vehicle_type: str
    driver_id: Optional[str] = None
    driver_name: str
    driver_phone: str
    client_name: str
    client_phone: str
    pickup_location: str
    drop_location: str
    reporting_time: datetime
    balance_amount: float
    payment_link: Optional[str] = None
    payment_status: str
    trip_status: str
    notes: Optional[str] = None
    driver_msg_sent: bool
    client_msg_sent: bool
    created_at: datetime
