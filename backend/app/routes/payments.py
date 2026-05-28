from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.routes.auth import require_owner
from app.schemas.payment import PaymentCreateRequest, PaymentResponse
from app.schemas.trip import TripResponse
from app.services import payments_service

router = APIRouter()

@router.post(
    "/",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a payment and update trip cost",
)
async def create_payment(
    data: PaymentCreateRequest,
    current_owner=Depends(require_owner),
):
    db = get_database()
    try:
        updated_trip = await payments_service.add_payment(data, current_owner.id, db)
        return updated_trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/",
    response_model=list[PaymentResponse],
    summary="List all payment transactions",
)
async def list_payments(current_owner=Depends(require_owner)):
    db = get_database()
    return await payments_service.get_all_transactions(current_owner.id, db)

@router.delete(
    "/{payment_id}",
    summary="Delete a payment transaction",
)
async def delete_payment(payment_id: str, current_owner=Depends(require_owner)):
    db = get_database()
    success = await payments_service.delete_payment(payment_id, current_owner.id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment deleted"}
