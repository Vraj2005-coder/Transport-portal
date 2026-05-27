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
        "puc": data.puc,
        "status": data.status,
        "truck_size": data.truck_size,
        "body_type": data.body_type,
        "truck_category": data.truck_category,
        "bus_type": data.bus_type,
        "seating_capacity": data.seating_capacity,
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


async def get_enriched_dashboard_stats(owner_id: str, db: AsyncIOMotorDatabase) -> dict:
    """
    Compile detailed statistics for the admin dashboard:
    - Available (Active), Booked, Maintenance vehicle counts
    - Vehicle type distribution
    - Document expiry alerts (for insurance, permit, fitness, puc within 30 days or past)
    - Dynamic mock payments summary
    - Upcoming driver duties list
    """
    # 1. Vehicle counts by status
    available_vehicles = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Active"})
    booked_vehicles = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Booked"})
    maintenance_vehicles = await db.vehicles.count_documents({"owner_id": owner_id, "status": "Maintenance"})
    total_vehicles = available_vehicles + booked_vehicles + maintenance_vehicles

    # 2. Type distribution
    pipeline = [
        {"$match": {"owner_id": owner_id}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    type_distribution = {}
    async for doc in db.vehicles.aggregate(pipeline):
        t = doc["_id"] or "Unknown"
        type_distribution[t] = doc["count"]

    # 3. Document Expiry Alerts (Insurance, Permit, Fitness, PUC)
    today_date = date.today()
    cursor = db.vehicles.find({"owner_id": owner_id})
    document_expiry_alerts = []
    pending_docs_set = set() # Store vehicle ids with expiring/expired docs
    
    async for v in cursor:
        v_num = v.get("number", "Unknown")
        v_id = str(v.get("_id"))
        doc_fields = [
            ("Insurance", v.get("insurance")),
            ("Permit", v.get("permit")),
            ("Fitness", v.get("fitness")),
            ("PUC", v.get("puc")),
        ]
        for label, date_str in doc_fields:
            if not date_str:
                continue
            try:
                exp_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                days_left = (exp_date - today_date).days
                if days_left <= 30:
                    status = "Expired" if days_left < 0 else "Expiring Soon"
                    document_expiry_alerts.append({
                        "vehicle_number": v_num,
                        "doc_type": label,
                        "expiry_date": date_str,
                        "days_left": days_left,
                        "status": status
                    })
                    pending_docs_set.add(v_id)
            except Exception:
                pass

    # Sort alerts: expired first (most negative days_left), then soon-to-expire ascending
    document_expiry_alerts.sort(key=lambda x: x["days_left"])

    # 4. Dynamic payments summary based on vehicle status
    pending_amount = 0.0
    pending_count = 0
    overdue_amount = 0.0
    overdue_count = 0

    # Booked -> Pending trip payment $1200
    pending_amount += booked_vehicles * 1200.0
    pending_count += booked_vehicles
    
    # Maintenance -> Overdue repair bill $650
    overdue_amount += maintenance_vehicles * 650.0
    overdue_count += maintenance_vehicles

    # Deterministic active vehicle pending payments
    cursor = db.vehicles.find({"owner_id": owner_id, "status": "Active"})
    async for v in cursor:
        v_num = v.get("number", "")
        if sum(ord(c) for c in v_num) % 2 == 0:
            pending_amount += 300.0
            pending_count += 1

    payments = {
        "pending_amount": pending_amount,
        "overdue_amount": overdue_amount,
        "pending_count": pending_count,
        "overdue_count": overdue_count
    }

    # 5. Upcoming driver duties
    upcoming_duties = []
    drivers_cursor = db.users.find({"role": "driver", "owner_id": owner_id, "is_active": True})
    mock_routes = [
        "Mumbai ➔ Pune",
        "Delhi ➔ Jaipur",
        "Bangalore ➔ Chennai",
        "Hyderabad ➔ Vijayawada",
        "Kolkata ➔ Haldia",
        "Ahmedabad ➔ Surat",
        "Pune Hub Delivery",
        "Chennai Port Logistics"
    ]
    async for d in drivers_cursor:
        assigned_truck_id = d.get("assigned_truck_id")
        if assigned_truck_id:
            try:
                v = await db.vehicles.find_one({"_id": ObjectId(assigned_truck_id)})
                if v:
                    v_num = v.get("number", "Unknown")
                    v_status = v.get("status", "Active")
                    
                    driver_name = d.get("name", "Unknown")
                    route_idx = sum(ord(c) for c in driver_name) % len(mock_routes)
                    route = mock_routes[route_idx]
                    
                    if v_status == "Booked":
                        duty_status = "On Trip"
                    elif v_status == "Maintenance":
                        duty_status = "Suspended (Maintenance)"
                    else:
                        duty_status = "Ready"
                        
                    upcoming_duties.append({
                        "driver_name": driver_name,
                        "vehicle_number": v_num,
                        "route": route,
                        "status": duty_status
                    })
            except Exception:
                pass

    return {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "booked_vehicles": booked_vehicles,
        "maintenance_vehicles": maintenance_vehicles,
        "type_distribution": type_distribution,
        "document_expiry_alerts": document_expiry_alerts,
        "payments": payments,
        "upcoming_duties": upcoming_duties,
        "pending_documents_count": len(pending_docs_set)
    }
