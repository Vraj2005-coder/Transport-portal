"""
Vehicle routes — CRUD endpoints for managing vehicles.

Route summary:
  GET  /api/vehicles        → List all vehicles (owner-auth required)
  POST /api/vehicles        → Add a new vehicle (owner-auth required)
  GET  /api/vehicles/{id}   → Get a single vehicle by ID
  PUT  /api/vehicles/{id}   → Update a vehicle (owner-auth required)
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.routes.auth import get_current_user, require_owner
from app.schemas.vehicle import (
    VehicleCreateRequest,
    VehicleUpdateRequest,
    VehicleResponse,
)
from app.services import vehicle_service

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# List all vehicles
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=list[VehicleResponse],
    summary="List all vehicles for the logged-in owner",
)
async def list_vehicles(current_owner=Depends(require_owner)):
    """
    Returns all vehicles registered under the authenticated owner.
    Used by the Vehicles.jsx management table.
    """
    db = get_database()
    return await vehicle_service.get_all_vehicles(current_owner.id, db)


# ──────────────────────────────────────────────────────────────────────────────
# Add a vehicle
# ──────────────────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new vehicle",
)
async def add_vehicle(
    data: VehicleCreateRequest,
    current_owner=Depends(require_owner),
):
    """
    Owner-only: adds a new vehicle to the fleet.
    Maps to the Add Vehicle form in Vehicles.jsx.
    """
    db = get_database()
    return await vehicle_service.create_vehicle(data, current_owner.id, db)


# ──────────────────────────────────────────────────────────────────────────────
# Get single vehicle
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Get a single vehicle by ID",
)
async def get_vehicle(
    vehicle_id: str,
    current_user=Depends(get_current_user),
):
    """
    Returns vehicle details by ID.
    Used by VehicleDetails.jsx.
    """
    db = get_database()
    vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id, db)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )
    return vehicle


# ──────────────────────────────────────────────────────────────────────────────
# Update a vehicle
# ──────────────────────────────────────────────────────────────────────────────

@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Update vehicle details",
)
async def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdateRequest,
    current_owner=Depends(require_owner),
):
    """
    Owner-only: partially updates a vehicle document.
    Maps to the Edit Vehicle / Save Vehicle flow in VehicleDetails.jsx.
    """
    db = get_database()
    vehicle = await vehicle_service.update_vehicle(vehicle_id, data, db)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )
    return vehicle
