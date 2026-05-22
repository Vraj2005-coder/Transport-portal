"""
Vehicle service — business logic for CRUD operations on the vehicles collection.
"""
from datetime import datetime, date
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.vehicle import VehicleInDB
from app.schemas.vehicle import VehicleCreateRequest, VehicleUpdateRequest


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _to_response(doc: dict) -> dict:
    """Convert a raw MongoDB document to a clean dict for the response schema."""
    doc["id"] = str(doc.pop("_id"))
    doc.pop("owner_id", None)
    doc.pop("created_at", None)
    doc.pop("updated_at", None)
    return doc


# ──────────────────────────────────────────────────────────────────────────────
# CRUD
# ──────────────────────────────────────────────────────────────────────────────

async def create_vehicle(
    data: VehicleCreateRequest,
    owner_id: str,
    db: AsyncIOMotorDatabase,
) -> dict:
    """Insert a new vehicle document into MongoDB."""
    now = datetime.utcnow()
    doc = {
        "owner_id": owner_id,
        "number": data.number,
        "type": data.type,
        "model": data.model,
        "driver": data.driver,
        "driver_id": data.driver_id,
        "insurance": data.insurance,
        "permit": data.permit,
        "fitness": data.fitness,
        "status": data.status,
        "location": data.location,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.vehicles.insert_one(doc)
    vehicle_id = str(result.inserted_id)
    doc["_id"] = result.inserted_id
    
    if data.driver_id:
        try:
            await db.users.update_one(
                {"_id": ObjectId(data.driver_id), "role": "driver"},
                {"$set": {"assigned_truck_id": vehicle_id}}
            )
        except Exception:
            pass

    return _to_response(doc)


async def get_all_vehicles(
    owner_id: str,
    db: AsyncIOMotorDatabase,
) -> list[dict]:
    """Return all vehicles belonging to the owner."""
    cursor = db.vehicles.find({"owner_id": owner_id})
    vehicles = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        vehicles.append(_to_response(doc))
    return vehicles


async def get_vehicle_by_id(
    vehicle_id: str,
    db: AsyncIOMotorDatabase,
) -> Optional[dict]:
    """Return a single vehicle by its MongoDB ObjectId."""
    try:
        oid = ObjectId(vehicle_id)
    except Exception:
        return None
    doc = await db.vehicles.find_one({"_id": oid})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return _to_response(doc)


async def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdateRequest,
    db: AsyncIOMotorDatabase,
) -> Optional[dict]:
    """Partially update a vehicle document."""
    try:
        oid = ObjectId(vehicle_id)
    except Exception:
        return None

    old_vehicle = await db.vehicles.find_one({"_id": oid})
    if not old_vehicle:
        return None
    old_driver_id = old_vehicle.get("driver_id")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        doc = await db.vehicles.find_one({"_id": oid})
        if doc:
            doc["_id"] = str(doc["_id"])
            return _to_response(doc)
        return None

    updates["updated_at"] = datetime.utcnow()
    await db.vehicles.update_one({"_id": oid}, {"$set": updates})

    new_driver_id = updates.get("driver_id", old_driver_id)
    if new_driver_id != old_driver_id:
        if old_driver_id:
            try:
                await db.users.update_one(
                    {"_id": ObjectId(old_driver_id), "role": "driver"},
                    {"$set": {"assigned_truck_id": None}}
                )
            except Exception:
                pass
        if new_driver_id:
            try:
                await db.users.update_one(
                    {"_id": ObjectId(new_driver_id), "role": "driver"},
                    {"$set": {"assigned_truck_id": vehicle_id}}
                )
            except Exception:
                pass

    doc = await db.vehicles.find_one({"_id": oid})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return _to_response(doc)


# ──────────────────────────────────────────────────────────────────────────────
# Stats helpers
# ──────────────────────────────────────────────────────────────────────────────

async def get_vehicle_counts(owner_id: str, db: AsyncIOMotorDatabase) -> dict:
    """Return counts of vehicles by status for admin stats."""
    total = await db.vehicles.count_documents({"owner_id": owner_id})
    active = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Active"})
    booked = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Booked"})
    maintenance = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Maintenance"})
    return {
        "total": total,
        "active": active,
        "booked": booked,
        "maintenance": maintenance,
    }


async def get_recent_activity(owner_id: str, db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    """Return the most recently updated vehicles as activity rows."""
    cursor = db.vehicles.find(
        {"owner_id": owner_id},
        sort=[("updated_at", -1)],
    ).limit(limit)
    rows = []
    async for doc in cursor:
        rows.append({
            "vehicle": doc.get("number", ""),
            "driver": doc.get("driver", ""),
            "status": doc.get("status", ""),
            "location": doc.get("location", ""),
        })
    return rows


async def get_expiring_documents_count(owner_id: str, db: AsyncIOMotorDatabase, days: int = 30) -> int:
    """Count vehicles whose insurance, permit, or fitness expires within `days` days."""
    today = date.today().isoformat()
    cutoff = date.fromordinal(date.today().toordinal() + days).isoformat()
    count = await db.vehicles.count_documents({
        "owner_id": owner_id,
        "$or": [
            {"insurance": {"$gte": today, "$lte": cutoff}},
            {"permit": {"$gte": today, "$lte": cutoff}},
            {"fitness": {"$gte": today, "$lte": cutoff}},
        ],
    })
    return count
