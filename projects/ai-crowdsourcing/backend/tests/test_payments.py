import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch, MagicMock


def test_create_payment_intent_returns_client_secret():
    """PaymentIntentが作成されclient_secretが返る"""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = MagicMock(
            id="pi_test123",
            client_secret="pi_test123_secret_abc",
            status="requires_capture"
        )
        from services.stripe import create_payment_intent
        result = create_payment_intent(amount=10000, worker_stripe_id="acct_worker1")
        assert result["client_secret"] == "pi_test123_secret_abc"
        assert result["payment_intent_id"] == "pi_test123"


def test_capture_payment_succeeds():
    """PaymentIntentのキャプチャが成功する"""
    with patch("stripe.PaymentIntent.capture") as mock_capture:
        mock_capture.return_value = MagicMock(status="succeeded")
        from services.stripe import capture_payment
        result = capture_payment("pi_test123")
        assert result["status"] == "succeeded"


def test_platform_fee_is_10_percent():
    """プラットフォーム手数料が10%計算される"""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = MagicMock(
            id="pi_test456",
            client_secret="secret",
            status="requires_capture"
        )
        from services.stripe import create_payment_intent
        result = create_payment_intent(amount=10000, worker_stripe_id="acct_worker1")
        assert result["platform_fee"] == 1000


def test_refund_payment_cancels_intent():
    """案件キャンセル時にPaymentIntentがキャンセルされる"""
    with patch("stripe.PaymentIntent.cancel") as mock_cancel:
        mock_cancel.return_value = MagicMock(status="canceled")
        from services.stripe import refund_payment
        result = refund_payment("pi_test123")
        assert result["status"] == "canceled"
