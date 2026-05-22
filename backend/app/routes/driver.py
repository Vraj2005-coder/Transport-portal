"""
Driver routes — dashboard stats and current trip for the logged-in driver.

Route summary:
  GET /api/driver/stats         → { assigned_trips, completed_trips, vehicle_status }
  GET /api/driver/current-trip  → current active trip details
"""
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
    - Assigned Trips  (placeholder — trips module not yet built)
    - Completed Trips (placeholder)
    - Vehicle Status  (from the driver's assigned vehicle)
    """
    db = get_database()

    vehicle_status = "No Vehicle Assigned"

    # If the driver has an assigned vehicle, fetch its current status
    if current_driver.assigned_truck_id:
        from bson import ObjectId
        try:
            oid = ObjectId(current_driver.assigned_truck_id)
            vehicle_doc = await db.vehicles.find_one({"_id": oid})
            if vehicle_doc:
                vehicle_status = vehicle_doc.get("status", "Unknown")
        except Exception:
            pass

    return DriverStatsResponse(
        assigned_trips=0,       # Trips module to be built separately
        completed_trips=0,
        vehicle_status=vehicle_status,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Current trip
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/current-trip",
    response_model=CurrentTripResponse,
    summary="Driver's current active trip",
)
async def get_current_trip(current_driver=Depends(require_driver)):
    """
    Returns the driver's current trip details shown in the
    'Current Trip' table in DriverDashboard.jsx.

    Trips module not yet built — returns the assigned vehicle info
    with 'On Trip' status as a placeholder until trips are implemented.
    """
    db = get_database()

    if not current_driver.assigned_truck_id:
        return CurrentTripResponse(
            vehicle=None,
            route=None,
            status="No Active Trip",
            distance=None,
        )

    from bson import ObjectId
    try:
        oid = ObjectId(current_driver.assigned_truck_id)
        vehicle_doc = await db.vehicles.find_one({"_id": oid})
    except Exception:
        vehicle_doc = None

    if not vehicle_doc:
        return CurrentTripResponse(
            vehicle=None,
            route=None,
            status="No Active Trip",
            distance=None,
        )

    return CurrentTripResponse(
        vehicle=vehicle_doc.get("number"),
        route=None,             # Route info will come from trips module
        status=vehicle_doc.get("status", "Unknown"),
        distance=None,
    )
