"""
Trips routes — CRUD endpoints for managing trips/bookings.

Route summary:
  GET  /api/trips        → List all trips
  POST /api/trips        → Create a new trip (triggers messaging)
  GET  /api/trips/{id}   → Get a single trip
  PUT  /api/trips/{id}   → Update a trip
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.routes.auth import require_owner
from app.schemas.trip import TripCreateRequest, TripResponse, TripUpdateRequest
from app.services import trip_service

router = APIRouter()


@router.get(
    "/",
    response_model=list[TripResponse],
    summary="List all trips",
)
async def list_trips(current_owner=Depends(require_owner)):
    """List all trips for the authenticated owner."""
    db = get_database()
    return await trip_service.get_all_trips(current_owner.id, db)


@router.post(
    "/",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new trip",
)
async def create_trip(
    data: TripCreateRequest,
    current_owner=Depends(require_owner),
):
    """
    Creates a new trip.
    This also triggers Twilio SMS messages to the driver and client,
    generates a payment link, and schedules reminders.
    """
    db = get_database()
    try:
        return await trip_service.create_trip(data, current_owner.id, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/{trip_id}",
    response_model=TripResponse,
    summary="Get single trip",
)
async def get_trip(
    trip_id: str,
    current_owner=Depends(require_owner),
):
    """Get single trip details."""
    db = get_database()
    trip = await trip_service.get_trip_by_id(trip_id, current_owner.id, db)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put(
    "/{trip_id}",
    response_model=TripResponse,
    summary="Update a trip",
)
async def update_trip(
    trip_id: str,
    data: TripUpdateRequest,
    current_owner=Depends(require_owner),
):
    """Update trip details and reschedule reminders if reporting time changed."""
    db = get_database()
    trip = await trip_service.update_trip(trip_id, data, current_owner.id, db)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.delete(
    "/all",
    summary="Delete all trips (cleanup)",
)
async def delete_all_trips(current_owner=Depends(require_owner)):
    """Delete all trips for the owner. Used for testing/cleanup."""
    db = get_database()
    deleted_count = await trip_service.delete_all_trips(current_owner.id, db)
    return {"message": f"Deleted {deleted_count} trips"}
