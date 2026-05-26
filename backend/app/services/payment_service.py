"""
Payment Service — generates dummy Razorpay-style payment links.

Designed to be swapped with real Razorpay SDK later:
  Just replace create_payment_link() internals with:
    razorpay_client.payment_link.create({...})
  No other code changes needed.
"""
import hashlib


# ──────────────────────────────────────────────────────────────────────────────
# Dummy Razorpay link generator
# ──────────────────────────────────────────────────────────────────────────────

def create_payment_link(
    trip_id: str,
    amount: float,
    client_name: str,
) -> str:
    """
    Generate a dummy Razorpay-style payment link.

    Format: https://rzp.io/l/{short_code}
    Short code is a deterministic 8-char hash of trip_id so it's
    stable across calls and unique per trip.

    To go live: replace this function body with:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        response = client.payment_link.create({
            "amount": int(amount * 100),   # Razorpay uses paise
            "currency": "INR",
            "description": f"Trip payment for {client_name}",
            "reference_id": trip_id,
            "reminder_enable": True,
            "notify": {"sms": True, "email": False},
        })
        return response["short_url"]
    """
    # Deterministic short code: first 8 chars of SHA256(trip_id)
    short_code = hashlib.sha256(trip_id.encode()).hexdigest()[:8].upper()
    return f"https://rzp.io/l/{short_code}"
