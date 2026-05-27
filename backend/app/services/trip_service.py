"""
Trip service — business logic for CRUD operations on trips.
Handles integration with Messaging, Scheduler, and Payment services.
"""
from datetime import datetime
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.trip import TripCreateRequest, TripUpdateRequest
from app.services.messaging_service import send_driver_trip_message, send_client_booking_message
from app.services.payment_service import create_payment_link
from app.services.scheduler_service import schedule_trip_reminders, cancel_trip_reminders


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _to_response(doc: dict) -> dict:
    """Convert raw MongoDB trip to response schema dict."""
    doc["id"] = str(doc.pop("_id"))
    doc.pop("owner_id", None)
    # Convert dates to strings for JSON serialisation
    if "reporting_time" in doc and isinstance(doc["reporting_time"], datetime):
        doc["reporting_time"] = doc["reporting_time"].isoformat()
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    if "updated_at" in doc and isinstance(doc["updated_at"], datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc


# ──────────────────────────────────────────────────────────────────────────────
# CRUD
# ──────────────────────────────────────────────────────────────────────────────

async def create_trip(
    data: TripCreateRequest,
    owner_id: str,
    db: AsyncIOMotorDatabase,
) -> dict:
    """
    Create a new trip.
    1. Fetch Vehicle & Driver info
    2. Generate Payment Link
    3. Save to DB
    4. Send SMS to Driver & Client
    5. Schedule Reminders
    """
    now = datetime.utcnow()
    
    # Fetch Vehicle
    vehicle = await db.vehicles.find_one({"_id": ObjectId(data.vehicle_id)})
    if not vehicle:
        raise ValueError("Vehicle not found")
        
    driver_id = vehicle.get("driver_id")
    driver = None
    if driver_id:
        driver = await db.users.find_one({"_id": ObjectId(driver_id), "role": "driver"})
    
    if not driver:
        raise ValueError("No valid driver assigned to this vehicle")

    # Build document
    doc = {
        "owner_id": owner_id,
        "trip_id": data.trip_id,
        "vehicle_id": data.vehicle_id,
        "vehicle_number": vehicle.get("number", ""),
        "vehicle_type": vehicle.get("type", ""),
        "driver_id": driver_id,
        "driver_name": driver.get("name", ""),
        "driver_phone": driver.get("phone", ""),
        "client_name": data.client_name,
        "client_phone": data.client_phone,
        "pickup_location": data.pickup_location,
        "drop_location": data.drop_location,
        "reporting_time": data.reporting_time,
        "notes": data.notes,
        "balance_amount": data.balance_amount,
        "payment_status": "Pending",
        "trip_status": "Scheduled",
        "driver_msg_sent": False,
        "client_msg_sent": False,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.trips.insert_one(doc)
    trip_id = str(result.inserted_id)
    doc["_id"] = result.inserted_id
    doc["id"] = trip_id

    # Generate Payment Link
    payment_link = None
    if data.balance_amount > 0:
        payment_link = create_payment_link(trip_id, data.balance_amount, data.client_name)
        await db.trips.update_one({"_id": doc["_id"]}, {"$set": {"payment_link": payment_link}})
        doc["payment_link"] = payment_link

    # Send Messages (Fire & Forget)
    driver_sent = send_driver_trip_message(
        driver={"name": doc["driver_name"], "phone": doc["driver_phone"]},
        trip=doc,
        vehicle=vehicle
    )
    
    client_sent = send_client_booking_message(
        trip=doc,
        vehicle=vehicle,
        payment_link=payment_link
    )
    
    if driver_sent or client_sent:
        await db.trips.update_one(
            {"_id": doc["_id"]},
            {"$set": {"driver_msg_sent": driver_sent, "client_msg_sent": client_sent}}
        )
        doc["driver_msg_sent"] = driver_sent
        doc["client_msg_sent"] = client_sent

    # Update Vehicle Status
    await db.vehicles.update_one({"_id": vehicle["_id"]}, {"$set": {"status": "Booked", "updated_at": now}})

    # Schedule Reminders
    schedule_trip_reminders(doc, doc["driver_phone"], doc["driver_name"])

    return _to_response(doc)


async def get_all_trips(owner_id: str, db: AsyncIOMotorDatabase) -> list[dict]:
    """List all trips for the owner."""
    cursor = db.trips.find({"owner_id": owner_id}).sort("reporting_time", -1)
    trips = []
    async for doc in cursor:
        trips.append(_to_response(doc))
    return trips


async def get_trip_by_id(trip_id: str, owner_id: str, db: AsyncIOMotorDatabase) -> Optional[dict]:
    """Get single trip."""
    try:
        oid = ObjectId(trip_id)
    except Exception:
        return None
    doc = await db.trips.find_one({"_id": oid, "owner_id": owner_id})
    if not doc:
        return None
    return _to_response(doc)


async def update_trip(
    trip_id: str,
    data: TripUpdateRequest,
    owner_id: str,
    db: AsyncIOMotorDatabase,
) -> Optional[dict]:
    """Update trip and reschedule reminders if reporting time changes."""
    try:
        oid = ObjectId(trip_id)
    except Exception:
        return None

    old_doc = await db.trips.find_one({"_id": oid, "owner_id": owner_id})
    if not old_doc:
        return None

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        return _to_response(old_doc)

    updates["updated_at"] = datetime.utcnow()
    await db.trips.update_one({"_id": oid}, {"$set": updates})

    doc = await db.trips.find_one({"_id": oid})
    
    # Reschedule reminders if reporting time changed
    if "reporting_time" in updates:
        schedule_trip_reminders(doc, doc["driver_phone"], doc["driver_name"])
        
    # Free up vehicle if cancelled/completed
    if updates.get("trip_status") in ["Completed", "Cancelled"]:
        cancel_trip_reminders(trip_id)
        if doc.get("vehicle_id"):
            await db.vehicles.update_one(
                {"_id": ObjectId(doc["vehicle_id"])},
                {"$set": {"status": "Active", "updated_at": datetime.utcnow()}}
            )

    return _to_response(doc)


async def delete_all_trips(owner_id: str, db: AsyncIOMotorDatabase) -> int:
    """Delete all trips for the owner (useful for testing/cleanup)."""
    # Cancel all reminders first
    cursor = db.trips.find({"owner_id": owner_id})
    async for doc in cursor:
        trip_id = str(doc["_id"])
        cancel_trip_reminders(trip_id)
        
        # Free up vehicle
        if doc.get("vehicle_id"):
            await db.vehicles.update_one(
                {"_id": ObjectId(doc["vehicle_id"])},
                {"$set": {"status": "Active", "updated_at": datetime.utcnow()}}
            )
            
    result = await db.trips.delete_many({"owner_id": owner_id})
    return result.deleted_count
