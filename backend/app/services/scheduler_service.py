"""
Scheduler Service — handles background jobs using APScheduler.
Used for scheduling duty reminder SMS alerts (2hr and 1hr before trip).
"""
import logging
from datetime import datetime, timedelta
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore

from app.services.messaging_service import send_driver_reminder

logger = logging.getLogger(__name__)

# Singleton scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


def start_scheduler():
    """Start the APScheduler. Called in FastAPI lifespan."""
    global scheduler
    jobstores = {
        'default': MemoryJobStore()
    }
    scheduler = AsyncIOScheduler(jobstores=jobstores)
    scheduler.start()
    logger.info("Scheduler started.")


def stop_scheduler():
    """Stop the APScheduler. Called in FastAPI lifespan."""
    global scheduler
    if scheduler:
        scheduler.shutdown()
        logger.info("Scheduler stopped.")


# ──────────────────────────────────────────────────────────────────────────────
# Job Scheduling
# ──────────────────────────────────────────────────────────────────────────────

def _remind_driver_job(driver_phone: str, driver_name: str, trip: dict, hours_before: int):
    """The actual job function that gets called by the scheduler."""
    logger.info(f"Executing reminder job for trip {trip.get('id')} ({hours_before} hr before)")
    send_driver_reminder(driver_phone, driver_name, trip, hours_before)


def schedule_trip_reminders(trip: dict, driver_phone: str, driver_name: str):
    """
    Schedule 2-hour and 1-hour reminders for a given trip.
    Jobs are given specific IDs so they can be cancelled if needed.
    """
    if not scheduler or not scheduler.running:
        logger.warning("Scheduler is not running, cannot schedule reminders.")
        return

    reporting_time = trip.get("reporting_time")
    if not reporting_time or not isinstance(reporting_time, datetime):
        return

    # If reporting_time is timezone-aware, strip the tzinfo for comparison with utcnow
    if reporting_time.tzinfo is not None:
        reporting_time = reporting_time.replace(tzinfo=None)

    now = datetime.utcnow()
    trip_id = str(trip.get("id") or trip.get("_id"))

    # 2 hours before
    run_date_2hr = reporting_time - timedelta(hours=2)
    if run_date_2hr > now:
        job_id_2hr = f"trip_{trip_id}_remind_2hr"
        # Remove existing if any (e.g. on trip update)
        if scheduler.get_job(job_id_2hr):
            scheduler.remove_job(job_id_2hr)
            
        scheduler.add_job(
            _remind_driver_job,
            "date",
            run_date=run_date_2hr,
            args=[driver_phone, driver_name, trip, 2],
            id=job_id_2hr
        )
        logger.info(f"Scheduled 2hr reminder for trip {trip_id} at {run_date_2hr}")

    # 1 hour before
    run_date_1hr = reporting_time - timedelta(hours=1)
    if run_date_1hr > now:
        job_id_1hr = f"trip_{trip_id}_remind_1hr"
        if scheduler.get_job(job_id_1hr):
            scheduler.remove_job(job_id_1hr)
            
        scheduler.add_job(
            _remind_driver_job,
            "date",
            run_date=run_date_1hr,
            args=[driver_phone, driver_name, trip, 1],
            id=job_id_1hr
        )
        logger.info(f"Scheduled 1hr reminder for trip {trip_id} at {run_date_1hr}")


def cancel_trip_reminders(trip_id: str):
    """Cancel any pending reminders for a trip (e.g. if cancelled)."""
    if not scheduler:
        return
        
    for job_id in (f"trip_{trip_id}_remind_2hr", f"trip_{trip_id}_remind_1hr"):
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)
            logger.info(f"Cancelled reminder job: {job_id}")
