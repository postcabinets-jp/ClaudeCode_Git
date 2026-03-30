from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.stripe import create_payment_intent, capture_payment, refund_payment
from db.supabase import get_client

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentIntentRequest(BaseModel):
    project_id: str
    amount: int
    worker_stripe_id: str


@router.post("/authorize")
async def authorize_payment(payload: PaymentIntentRequest):
    result = create_payment_intent(payload.amount, payload.worker_stripe_id)
    db = get_client()
    db.table("transactions").insert({
        "project_id": payload.project_id,
        "stripe_payment_intent_id": result["payment_intent_id"],
        "amount": payload.amount,
        "platform_fee": result["platform_fee"],
        "status": "authorized",
    }).execute()
    return result


@router.post("/{project_id}/capture")
async def capture(project_id: str):
    db = get_client()
    tx = db.table("transactions").select("stripe_payment_intent_id").eq("project_id", project_id).single().execute()
    if not tx.data:
        raise HTTPException(status_code=404, detail="取引が見つかりません")
    result = capture_payment(tx.data["stripe_payment_intent_id"])
    db.table("transactions").update({"status": "captured"}).eq("project_id", project_id).execute()
    db.table("projects").update({"status": "completed"}).eq("id", project_id).execute()
    return result


@router.post("/{project_id}/refund")
async def refund(project_id: str):
    db = get_client()
    tx = db.table("transactions").select("stripe_payment_intent_id").eq("project_id", project_id).single().execute()
    if not tx.data:
        raise HTTPException(status_code=404, detail="取引が見つかりません")
    result = refund_payment(tx.data["stripe_payment_intent_id"])
    db.table("transactions").update({"status": "refunded"}).eq("project_id", project_id).execute()
    return result
