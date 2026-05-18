"""
Truck document model as stored in MongoDB.
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class TruckStatus(str, Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    MAINTENANCE = "maintenance"


class TruckInDB(BaseModel):
    """Represents the full truck document as stored in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    owner_id: str                           # ObjectId of the owner
    registration_number: str               # Unique vehicle registration plate
    make: str                              # e.g. "Tata"
    model: str                             # e.g. "LPT 1613"
    year: int
    capacity_tons: float
    status: TruckStatus = TruckStatus.AVAILABLE
    assigned_driver_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

    @classmethod
    def from_mongo(cls, doc: dict) -> "TruckInDB":
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        if doc and "owner_id" in doc and isinstance(doc["owner_id"], ObjectId):
            doc["owner_id"] = str(doc["owner_id"])
        if doc and "assigned_driver_id" in doc and isinstance(doc["assigned_driver_id"], ObjectId):
            doc["assigned_driver_id"] = str(doc["assigned_driver_id"])
        return cls(**doc)
