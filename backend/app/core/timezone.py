"""
Central timezone configuration for the Synapse backend.
Strategy: Store everything in UTC. Frontend converts to IST for display.
"""
from datetime import timezone, datetime

UTC = timezone.utc

def now_utc() -> datetime:
    """Get current datetime in UTC."""
    return datetime.now(UTC)
