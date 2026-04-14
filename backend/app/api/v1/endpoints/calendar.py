import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.calendar_share import CalendarShare
from app.models.registration import Registration

router = APIRouter()

@router.post("/generate-link")
def generate_calendar_link(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Generate or retrieve a unique calendar share link for the user."""
    # Check if active token exists
    existing = db.query(CalendarShare).filter_by(user_id=current_user.id, is_active=True).first()
    if existing:
        return {"share_token": existing.share_token}
    
    # Generate new token
    new_token = str(uuid.uuid4())
    new_share = CalendarShare(user_id=current_user.id, share_token=new_token)
    db.add(new_share)
    db.commit()
    return {"share_token": new_token}

@router.post("/revoke-link")
def revoke_calendar_link(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Revoke all active calendar links for the user."""
    shares = db.query(CalendarShare).filter_by(user_id=current_user.id, is_active=True).all()
    for share in shares:
        share.is_active = False
    db.commit()
    return {"message": "Calendar links revoked successfully"}

@router.get("/{token}.ics", response_class=PlainTextResponse)
def get_shared_calendar_ics(token: str, db: Session = Depends(deps.get_db)):
    """Publicly accessible ICS file generator."""
    share = db.query(CalendarShare).filter_by(share_token=token, is_active=True).first()
    if not share:
        raise HTTPException(status_code=404, detail="Invalid or expired calendar link")
    
    user_registrations = db.query(Registration).filter_by(user_id=share.user_id).all()
    
    # Start building ICS file
    user_name = share.user.name.replace(',', '\\,')
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Synapse//Event Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:Synapse Calendar - {user_name}"
    ]
    
    for reg in user_registrations:
        event = reg.event
        if not event or not event.date:
            continue
            
        dtstart = event.date
        dtend = event.date + timedelta(hours=2)  # Default duration: 2 hours
        
        # Convert to YYYYMMDDTHHMMSSZ
        try:
            start_str = dtstart.strftime("%Y%m%dT%H%M%SZ")
            end_str = dtend.strftime("%Y%m%dT%H%M%SZ")
        except AttributeError:
            continue
            
        summary = (event.name or "").replace(',', '\\,').replace(';', '\\;')
        desc_parts = [event.description or ""]
        if event.organization and event.organization.name:
            desc_parts.append(f"Organized by: {event.organization.name}")
        description = "\\n\\n".join(p for p in desc_parts if p).replace(',', '\\,').replace(';', '\\;')
        location = (event.venue or "").replace(',', '\\,').replace(';', '\\;')
        uid = f"Synapse-EVENT-{event.id}-{share.user_id}@synapse.iitd.ac.in"
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"DTSTAMP:{stamp}",
            f"UID:{uid}",
            f"DTSTART:{start_str}",
            f"DTEND:{end_str}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description}",
            f"LOCATION:{location}",
            "END:VEVENT"
        ])
        
    ics_lines.append("END:VCALENDAR")
    return "\r\n".join(ics_lines)
