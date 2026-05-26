"""
Messaging Service — sends SMS via Twilio.

Designed as a thin, swappable layer:
  - Currently: Twilio SMS
  - To switch to n8n: replace send_sms() with an HTTP POST to your n8n webhook URL.
    No other code changes needed — all message templates stay the same.

All public functions are fire-and-forget (log errors, never raise).
Trip creation will NEVER fail because of an SMS error.
"""
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Core SMS sender (swap this to switch from Twilio → n8n)
# ──────────────────────────────────────────────────────────────────────────────

def _send_sms(to_phone: str, body: str) -> bool:
    """
    Send an SMS via Twilio.

    To switch to n8n later, replace this function with:
        import httpx
        response = httpx.post(
            "https://your-n8n-instance.com/webhook/sms",
            json={"to": to_phone, "message": body}
        )
        return response.status_code == 200

    Returns True on success, False on failure.
    """
    try:
        import requests
        from app.config import settings

        # --- FOR LOCAL TESTING: Print the SMS directly to the terminal ---
        print("\n" + "="*50)
        print(f"📩 SENDING MESSAGE TO (via n8n): {to_phone}")
        print("-" * 50)
        print(body)
        print("="*50 + "\n")

        webhook_url = getattr(settings, "N8N_WEBHOOK_URL", None)
        
        if not webhook_url or webhook_url == "your_n8n_webhook_url_here":
            logger.warning("N8N_WEBHOOK_URL not set in .env. Message was printed to terminal but not actually sent.")
            return True

        # Send a POST request to your n8n Webhook
        payload = {
            "to": to_phone,
            "message": body
        }
        
        response = requests.post(webhook_url, json=payload, timeout=10)
        
        if response.status_code in (200, 201):
            logger.info(f"Message sent to {to_phone} via n8n | Status: {response.status_code}")
            return True
        else:
            logger.error(f"n8n webhook failed for {to_phone}: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        logger.error(f"Failed to trigger n8n webhook for {to_phone}: {e}")
        return False


# ──────────────────────────────────────────────────────────────────────────────
# Public message functions
# ──────────────────────────────────────────────────────────────────────────────

def send_driver_trip_message(driver: dict, trip: dict, vehicle: dict) -> bool:
    """
    Send a trip assignment SMS to the driver.
    Triggered immediately when a trip is created.

    driver: dict with keys — name, phone
    trip:   dict with keys — client_name, pickup_location, drop_location, reporting_time, notes
    vehicle: dict with keys — number, type
    """
    reporting_dt = trip.get("reporting_time")
    if isinstance(reporting_dt, datetime):
        reporting_str = reporting_dt.strftime("%d %b %Y, %I:%M %p")
    else:
        reporting_str = str(reporting_dt)

    body = (
        f"New Trip Assigned - {vehicle.get('number', 'N/A')}\n"
        f"Client: {trip.get('client_name', 'N/A')}\n"
        f"Pickup: {trip.get('pickup_location', 'N/A')}\n"
        f"Drop: {trip.get('drop_location', 'N/A')}\n"
        f"Reporting Time: {reporting_str}\n"
        f"Vehicle: {vehicle.get('number', 'N/A')} ({vehicle.get('type', 'N/A')})\n"
    )
    if trip.get("notes"):
        body += f"Notes: {trip['notes']}\n"
    body += "Please be ready 15 min early."

    return _send_sms(driver["phone"], body)


def send_client_booking_message(trip: dict, vehicle: dict, payment_link: str) -> bool:
    """
    Send a booking confirmation SMS to the client.
    Triggered immediately when a trip is created.

    trip:    dict with keys — client_name, client_phone, driver_name, driver_phone,
                              pickup_location, drop_location, reporting_time, balance_amount
    vehicle: dict with keys — number, type
    """
    reporting_dt = trip.get("reporting_time")
    if isinstance(reporting_dt, datetime):
        reporting_str = reporting_dt.strftime("%d %b %Y, %I:%M %p")
    else:
        reporting_str = str(reporting_dt)

    balance = trip.get("balance_amount", 0)
    balance_str = f"Rs.{balance:,.0f}" if balance > 0 else "No balance due"

    body = (
        f"Booking Confirmed!\n"
        f"Driver: {trip.get('driver_name', 'N/A')} | Ph: {trip.get('driver_phone', 'N/A')}\n"
        f"Vehicle: {vehicle.get('number', 'N/A')} ({vehicle.get('type', 'N/A')})\n"
        f"Pickup: {trip.get('pickup_location', 'N/A')}\n"
        f"Reporting Time: {reporting_str}\n"
        f"Balance Due: {balance_str}\n"
    )
    if balance > 0:
        body += f"Pay here: {payment_link}"

    return _send_sms(trip["client_phone"], body)


def send_driver_reminder(driver_phone: str, driver_name: str, trip: dict, hours_before: int) -> bool:
    """
    Send a duty reminder SMS to the driver.
    Called by APScheduler at 2hr and 1hr before reporting_time.

    driver_phone:  str — driver's phone number
    driver_name:   str — driver's name (for personalisation)
    trip:          dict with keys — client_name, vehicle_number, pickup_location,
                                    drop_location, reporting_time
    hours_before:  int — 2 or 1 (used in message text)
    """
    reporting_dt = trip.get("reporting_time")
    if isinstance(reporting_dt, datetime):
        reporting_str = reporting_dt.strftime("%I:%M %p")
    else:
        reporting_str = str(reporting_dt)

    body = (
        f"Duty Reminder - {hours_before} Hour{'s' if hours_before > 1 else ''} to go!\n"
        f"Hi {driver_name}, your trip starts soon.\n"
        f"Client: {trip.get('client_name', 'N/A')}\n"
        f"Vehicle: {trip.get('vehicle_number', 'N/A')}\n"
        f"Pickup: {trip.get('pickup_location', 'N/A')}\n"
        f"Reporting at: {reporting_str}\n"
        f"Please be ready on time!"
    )

    return _send_sms(driver_phone, body)
