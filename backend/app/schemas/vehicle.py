"""
Pydantic schemas for vehicle request/response bodies.
These define what the API accepts and returns — not the DB models.
"""
from typing import Optional
from pydantic import BaseModel


# ──────────────────────────────────────────────────────────────────────────────
# Request schemas
# ──────────────────────────────────────────────────────────────────────────────

class VehicleCreateRequest(BaseModel):
    """Body for POST /api/vehicles"""
    number: str
    type: str
    model: str
    driver: str
    driver_id: Optional[str] = None
    insurance: Optional[str] = None     # Date string "YYYY-MM-DD"
    permit: Optional[str] = None
    fitness: Optional[str] = None
    status: str = "Active"              # "Active" | "Booked" | "Maintenance"
    location: Optional[str] = None


class VehicleUpdateRequest(BaseModel):
    """Body for PUT /api/vehicles/{id} — all fields optional"""
    number: Optional[str] = None
    type: Optional[str] = None
    model: Optional[str] = None
    driver: Optional[str] = None
    driver_id: Optional[str] = None
    insurance: Optional[str] = None
    permit: Optional[str] = None
    fitness: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# Response schemas
# ──────────────────────────────────────────────────────────────────────────────

class VehicleResponse(BaseModel):
    """Safe vehicle representation returned to the client."""
    id: str
    number: str
    type: str
    model: str
    driver: str
    driver_id: Optional[str] = None
    insurance: Optional[str] = None
    permit: Optional[str] = None
    fitness: Optional[str] = None
    status: str
    location: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# Admin stats / activity schemas
# ──────────────────────────────────────────────────────────────────────────────

class AdminStatsResponse(BaseModel):
    """Response for GET /api/admin/stats"""
    total_vehicles: int
    active_drivers: int
    trips_today: int
    pending_documents: int


class RecentActivityRow(BaseModel):
    """Single row in the recent vehicle activity table."""
    vehicle: str        # Registration number
    driver: str
    status: str
    location: Optional[str] = None


class RecentActivityResponse(BaseModel):
    """Response for GET /api/admin/recent-activity"""
    activities: list[RecentActivityRow]


# ──────────────────────────────────────────────────────────────────────────────
# Driver stats schema
# ──────────────────────────────────────────────────────────────────────────────

class DriverStatsResponse(BaseModel):
    """Response for GET /api/driver/stats"""
    assigned_trips: int
    completed_trips: int
    vehicle_status: str     # Status of the driver's assigned vehicle


class CurrentTripResponse(BaseModel):
    """Response for GET /api/driver/current-trip"""
    vehicle: Optional[str] = None
    route: Optional[str] = None
    status: Optional[str] = None
    distance: Optional[str] = None
