"""
Admin routes — dashboard stats and activity feed.

Route summary:
  GET /api/admin/stats           → { total_vehicles, active_drivers, trips_today, pending_documents }
  GET /api/admin/recent-activity → last 10 vehicle + driver activity rows
"""
from fastapi import APIRouter, Depends

from app.database import get_database
from app.models.user import UserRole
from app.routes.auth import require_owner
from app.schemas.vehicle import AdminStatsResponse, RecentActivityResponse
from app.services import vehicle_service

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# Dashboard stats
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Admin dashboard summary stats",
)
async def get_admin_stats(current_owner=Depends(require_owner)):
    """
    Returns counts for the 4 dashboard cards in AdminDashboard.jsx:
    - Total Vehicles
    - Active Drivers
    - Trips Today (placeholder — trips module not built yet)
    - Pending Documents (vehicles with expiring docs in next 30 days)
    """
    db = get_database()

    # Vehicle counts
    counts = await vehicle_service.get_vehicle_counts(current_owner.id, db)

    # Active drivers — users with role=driver, is_active=True, owner_id=current_owner
    active_drivers = await db.users.count_documents({
        "role": UserRole.DRIVER,
        "is_active": True,
        "owner_id": current_owner.id,
    })

    # Pending documents — vehicles with insurance/permit/fitness expiring in 30 days
    pending_documents = await vehicle_service.get_expiring_documents_count(
        current_owner.id, db, days=30
    )

    return AdminStatsResponse(
        total_vehicles=counts["total"],
        active_drivers=active_drivers,
        trips_today=0,          # Trips module to be built separately
        pending_documents=pending_documents,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Recent activity
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/recent-activity",
    response_model=RecentActivityResponse,
    summary="Recent vehicle activity for admin dashboard table",
)
async def get_recent_activity(current_owner=Depends(require_owner)):
    """
    Returns the 10 most recently updated vehicles as activity rows.
    Used by the 'Recent Vehicle Activity' table in AdminDashboard.jsx.
    """
    db = get_database()
    rows = await vehicle_service.get_recent_activity(current_owner.id, db, limit=10)
    return RecentActivityResponse(activities=rows)
