"""
Driver routes — dashboard stats and current trip for the logged-in driver.

Route summary:
  GET  /api/driver/stats         → { assigned_trips, completed_trips, vehicle_status }
  GET  /api/driver/current-trip  → full active trip details (for driver map)
  PUT  /api/driver/trip-status   → driver updates their own trip status
"""
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.models.user import UserRole
from app.routes.auth import get_current_user
from app.schemas.vehicle import DriverStatsResponse, CurrentTripResponse

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# Dependency: ensure caller is a driver
# ──────────────────────────────────────────────────────────────────────────────

async def require_driver(current_user=Depends(get_current_user)):
    """Dependency that ensures the caller is a Driver — raises 403 otherwise."""
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is restricted to drivers only.",
        )
    return current_user


# ──────────────────────────────────────────────────────────────────────────────
# Driver dashboard stats
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=DriverStatsResponse,
    summary="Driver dashboard summary stats",
)
async def get_driver_stats(current_driver=Depends(require_driver)):
    """
    Returns the 3 stat cards shown in DriverDashboard.jsx:
    - Assigned Trips  (Scheduled + On Trip)
    - Completed Trips
    - Vehicle Status  (from the driver's assigned vehicle)
    """
    db = get_database()

    driver_id = current_driver.id

    # Count trips by status for this driver
    assigned_count  = await db.trips.count_documents({
        "driver_id": driver_id,
        "trip_status": {"$in": ["Scheduled", "On Trip"]},
    })
    completed_count = await db.trips.count_documents({
        "driver_id": driver_id,
        "trip_status": "Completed",
    })

    vehicle_status = "No Vehicle Assigned"
    if current_driver.assigned_truck_id:
        try:
            oid = ObjectId(current_driver.assigned_truck_id)
            vehicle_doc = await db.vehicles.find_one({"_id": oid})
            if vehicle_doc:
                vehicle_status = vehicle_doc.get("status", "Unknown")
        except Exception:
            pass

    return DriverStatsResponse(
        assigned_trips=assigned_count,
        completed_trips=completed_count,
        vehicle_status=vehicle_status,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Current active trip (full data for the driver map)
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/current-trip",
    response_model=CurrentTripResponse,
    summary="Driver's current active trip with full route data",
)
async def get_current_trip(current_driver=Depends(require_driver)):
    """
    Returns the driver's active trip (Scheduled or On Trip).
    Includes pickup/drop locations, client info, GPS coords, and status.
    Used by DriverDashboard.jsx to render the map and trip info card.
    """
    db = get_database()
    driver_id = current_driver.id

    # Find the most recent active trip for this driver
    trip = await db.trips.find_one(
        {
            "driver_id": driver_id,
            "trip_status": {"$in": ["Scheduled", "On Trip"]},
        },
        sort=[("reporting_time", 1)],   # nearest upcoming first
    )

    if not trip:
        return CurrentTripResponse(status="No Active Trip")

    # Serialise ObjectId and datetime fields
    trip_id = str(trip["_id"])
    reporting_time = trip.get("reporting_time")
    if isinstance(reporting_time, datetime):
        reporting_time = reporting_time.isoformat()

    return CurrentTripResponse(
        id=trip_id,
        trip_id=trip.get("trip_id"),
        vehicle=trip.get("vehicle_number"),
        vehicle_id=trip.get("vehicle_id"),
        vehicle_type=trip.get("vehicle_type"),
        pickup_location=trip.get("pickup_location"),
        drop_location=trip.get("drop_location"),
        reporting_time=reporting_time,
        status=trip.get("trip_status"),
        started_at=trip.get("started_at").isoformat() if isinstance(trip.get("started_at"), datetime) else trip.get("started_at"),
        client_name=trip.get("client_name"),
        client_phone=trip.get("client_phone"),
        driver_lat=trip.get("driver_lat"),
        driver_lng=trip.get("driver_lng"),
        notes=trip.get("notes"),
    )


# ──────────────────────────────────────────────────────────────────────────────
# Driver updates their own trip status
# ──────────────────────────────────────────────────────────────────────────────

@router.put(
    "/trip-status",
    summary="Driver updates their active trip status",
)
async def update_trip_status(
    body: dict,
    current_driver=Depends(require_driver),
):
    """
    Driver-only: update the status of their current active trip.
    Allowed transitions:
      Scheduled  → On Trip   (driver starts the trip)
      On Trip    → Completed (driver completes the trip)
    """
    db = get_database()
    new_status = body.get("trip_status")

    if new_status not in ["On Trip", "Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid trip_status value.")

    driver_id = current_driver.id

    trip = await db.trips.find_one({
        "driver_id": driver_id,
        "trip_status": {"$in": ["Scheduled", "On Trip"]},
    })

    if not trip:
        raise HTTPException(status_code=404, detail="No active trip found.")

    now = datetime.utcnow()
    update_data = {"trip_status": new_status, "updated_at": now}

    if new_status == "On Trip" and trip.get("trip_status") == "Scheduled":
        update_data["started_at"] = now
    elif new_status == "Completed":
        update_data["completed_at"] = now
        if "distance_travelled_km" in body:
            try:
                update_data["distance_travelled_km"] = float(body["distance_travelled_km"])
            except ValueError:
                pass

    await db.trips.update_one(
        {"_id": trip["_id"]},
        {"$set": update_data},
    )

    # If completed/cancelled, free up the vehicle
    if new_status in ["Completed", "Cancelled"]:
        if trip.get("vehicle_id"):
            try:
                await db.vehicles.update_one(
                    {"_id": ObjectId(trip["vehicle_id"])},
                    {"$set": {"status": "Active", "updated_at": now}},
                )
            except Exception:
                pass

    return {"status": "ok", "trip_status": new_status}
