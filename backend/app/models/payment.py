from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field

class PaymentTransaction(BaseModel):
    """Represents a single payment transaction for a trip."""
    id: Optional[str] = Field(default=None, alias="_id")
    owner_id: str
    trip_id: str                      # ObjectId of the trip
    client_name: str
    vehicle_number: str
    amount: float
    method: str                       # e.g. "UPI", "Bank Transfer", "Cash"
    transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

    @classmethod
    def from_mongo(cls, doc: dict) -> "PaymentTransaction":
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        if doc and "trip_id" in doc and isinstance(doc["trip_id"], ObjectId):
            doc["trip_id"] = str(doc["trip_id"])
        if doc and "owner_id" in doc and isinstance(doc["owner_id"], ObjectId):
            doc["owner_id"] = str(doc["owner_id"])
        return cls(**doc)
