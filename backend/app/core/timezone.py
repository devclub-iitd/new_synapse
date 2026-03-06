"""
Central timezone configuration for the Synapse backend.
All datetime operations should use IST from this module.
"""
from datetime import timezone, timedelta, datetime

# Indian Standard Time = UTC + 5:30
IST = timezone(timedelta(hours=5, minutes=30))

def now_ist() -> datetime:
    """Get current datetime in IST."""
    return datetime.now(IST)
