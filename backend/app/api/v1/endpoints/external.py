"""
External API for organization websites.

Security: Per-org API key (sent via X-API-Key header).
Keys are generated from the org dashboard by HEAD-level roles.
Optional IP whitelisting per key.
"""

import secrets
import hashlib
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.api import deps
from app.models.event import Event
from app.models.organization import Organization
from app.models.registration import Registration
from app.models.user import User
from app.models.api_key import ApiKey
from app.schemas.event import EventOut

router = APIRouter()

API_KEY_HEADER = APIKeyHeader(name="X-API-Key")


# ------------------------------------------------------------------
# DEPENDENCY: Validate API key → resolve org
# ------------------------------------------------------------------
def get_org_from_api_key(
    request: Request,
    api_key: str = Depends(API_KEY_HEADER),
    db: Session = Depends(deps.get_db),
):
    """Authenticate via API key and return the org."""
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()

    record = (
        db.query(ApiKey)
        .filter(ApiKey.key_hash == key_hash, ApiKey.is_active == True)
        .first()
    )
    if not record:
        raise HTTPException(status_code=401, detail="Invalid or revoked API key")

    # Optional: IP whitelist check
    if record.allowed_ips:
        client_ip = request.client.host
        if client_ip not in record.allowed_ips:
            raise HTTPException(status_code=403, detail="Request from unauthorized IP")

    # Update last_used_at
    record.last_used_at = datetime.utcnow()
    db.commit()

    org = db.query(Organization).filter(Organization.id == record.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return org


# ------------------------------------------------------------------
# GET /external/events — list org's events
# ------------------------------------------------------------------
@router.get("/events", response_model=list[EventOut])
def list_events(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(deps.get_db),
    org: Organization = Depends(get_org_from_api_key),
):
    events = (
        db.query(Event)
        .options(joinedload(Event.organization))
        .filter(Event.org_id == org.id)
        .order_by(Event.date.desc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )
    return events


# ------------------------------------------------------------------
# GET /external/events/{event_id} — single event detail
# ------------------------------------------------------------------
@router.get("/events/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    org: Organization = Depends(get_org_from_api_key),
):
    event = (
        db.query(Event)
        .options(joinedload(Event.organization))
        .filter(Event.id == event_id, Event.org_id == org.id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "date": event.date,
        "registration_deadline": event.registration_deadline,
        "venue": event.venue,
        "image_url": event.image_url,
        "tags": event.tags,
        "is_private": event.is_private,
        "target_audience": event.target_audience,
        "custom_form_schema": event.custom_form_schema,
        "registration_count": len(event.registrations),
        "created_at": event.created_at,
    }


# ------------------------------------------------------------------
# POST /external/events/{event_id}/register — register a user by entry number
# ------------------------------------------------------------------
@router.post("/events/{event_id}/register")
def register_user(
    event_id: int,
    payload: dict,
    db: Session = Depends(deps.get_db),
    org: Organization = Depends(get_org_from_api_key),
):
    entry_number = payload.get("entry_number")
    custom_answers = payload.get("custom_answers", {})

    if not entry_number:
        raise HTTPException(status_code=400, detail="entry_number is required")

    event = db.query(Event).filter(Event.id == event_id, Event.org_id == org.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    user = db.query(User).filter(User.entry_number == entry_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in Synapse")

    existing = db.query(Registration).filter(
        Registration.user_id == user.id,
        Registration.event_id == event_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already registered for this event")

    reg = Registration(
        user_id=user.id,
        event_id=event_id,
        custom_answers=custom_answers,
    )
    db.add(reg)
    db.commit()
    return {"msg": "Registered successfully", "registration_id": reg.id}


# ------------------------------------------------------------------
# GET /external/events/{event_id}/registrations — list registrations
# ------------------------------------------------------------------
@router.get("/events/{event_id}/registrations")
def list_registrations(
    event_id: int,
    db: Session = Depends(deps.get_db),
    org: Organization = Depends(get_org_from_api_key),
):
    event = db.query(Event).filter(Event.id == event_id, Event.org_id == org.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    regs = (
        db.query(Registration)
        .options(joinedload(Registration.user))
        .filter(Registration.event_id == event_id)
        .all()
    )

    return [{
        "registration_id": reg.id,
        "name": reg.user.name,
        "email": reg.user.email,
        "entry_number": reg.user.entry_number,
        "department": reg.user.department.value if hasattr(reg.user.department, 'value') else reg.user.department,
        "custom_answers": reg.custom_answers,
        "registered_at": reg.registered_at,
    } for reg in regs]


# ------------------------------------------------------------------
# GET /external/org — get org info
# ------------------------------------------------------------------
@router.get("/org")
def get_org_info(
    org: Organization = Depends(get_org_from_api_key),
):
    return {
        "id": org.id,
        "name": org.name,
        "org_type": org.org_type,
        "banner_url": org.banner_url,
    }
