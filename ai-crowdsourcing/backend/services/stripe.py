import os
import stripe
from dotenv import load_dotenv

load_dotenv()

PLATFORM_FEE_RATE = 0.10  # 10%手数料


def _init_stripe() -> None:
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise ValueError("STRIPE_SECRET_KEY が設定されていません。")
    stripe.api_key = key


def create_payment_intent(amount: int, worker_stripe_id: str) -> dict:
    """
    エスクロー相当の事前授権PaymentIntentを作成する。
    capture_method="manual" で即時引き落としを防ぎ、
    納品確認後に capture_payment() で確定する。
    """
    _init_stripe()
    platform_fee = int(amount * PLATFORM_FEE_RATE)
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="jpy",
        capture_method="manual",
        transfer_data={"destination": worker_stripe_id},
        application_fee_amount=platform_fee,
    )
    return {
        "payment_intent_id": intent.id,
        "client_secret": intent.client_secret,
        "platform_fee": platform_fee,
    }


def capture_payment(payment_intent_id: str) -> dict:
    """納品確認後に支払いを確定する"""
    _init_stripe()
    intent = stripe.PaymentIntent.capture(payment_intent_id)
    return {"status": intent.status}


def refund_payment(payment_intent_id: str) -> dict:
    """案件キャンセル時に返金する"""
    _init_stripe()
    intent = stripe.PaymentIntent.cancel(payment_intent_id)
    return {"status": intent.status}
