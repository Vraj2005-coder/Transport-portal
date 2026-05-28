from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PaymentCreateRequest(BaseModel):
    trip_id: str
    trip_cost: float                  # To optionally update the trip's total cost
    amount_paid: float
    method: str
    transaction_id: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    trip_id: str
    client_name: str
    vehicle_number: str
    amount: float
    method: str
    transaction_id: Optional[str] = None
    created_at: datetime
