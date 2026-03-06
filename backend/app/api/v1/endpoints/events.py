from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
from app.schemas.event import EventOut, EventDetail
from app.services.recommender import get_event_recommendations
from sqlalchemy import func, case
from datetime import datetime, timedelta, timezone

router = APIRouter()


def check_user_eligibility(user: User, event: Event) -> bool:
    if not event.target_audience:
        return True

    target_depts = event.target_audience.get("depts", [])
    if target_depts:
        if not user.department:
            return False
        user_dept = user.department.value if hasattr(user.department, "value") else str(user.department)
        if user_dept not in target_depts:
            return False

    target_hostels = event.target_audience.get("hostels", [])
    if target_hostels:
        if not user.hostel:
            return False
        user_hostel = user.hostel.value if hasattr(user.hostel, "value") else str(user.hostel)
        if user_hostel not in target_hostels:
            return False

    target_years = event.target_audience.get("years", [])
    if target_years:
        try:
            target_years_int = [int(y) for y in target_years]
            if not user.current_year or user.current_year not in target_years_int:
                return False
        except (ValueError, TypeError):
            pass

    return True

def normalize_org_type(org_type: str) -> str:
    """
    Frontend sends: Clubs / Fests / Departments
    DB stores:      club / fest / department (lowercase)
    """
    if not org_type:
        return None

    mapping = {
        "Clubs": "club",
        "Fests": "fest",
        "Departments": "department",
        "Boards": "board",
        "Societies": "society"
    }
    return mapping.get(org_type, org_type.lower())


# ============================================================
# EVENTS FEED
# ============================================================
@router.get("/", response_model=List[EventOut])
def get_events(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional),
    sort_by: str = Query("date", pattern="^(date|popularity)$"),
    org_type: Optional[str] = None,
    item: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    now = datetime.now(timezone.utc)
    # six_months_ago = now - timedelta(days=180)
    # ✅ Visibility filter:
    # - Unauthenticated users: public events only
    # - Authenticated users: public events + private events from their orgs
    query = db.query(Event)
    if current_user and current_user.authorizations:
        user_org_names = [r.org_name.value if hasattr(r.org_name, 'value') else r.org_name for r in current_user.authorizations]
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Event.is_private == False,
                Event.org_name.in_(user_org_names)
            )
        )
    else:
        query = query.filter(Event.is_private == False)

    # ❌ Hide past events
    query = query.filter(Event.date >= now)

    # ✅ Org type filter
    if org_type:
        clean_type = normalize_org_type(org_type)
        query = query.filter(Event.org_type == clean_type)

    # ✅ Org name filter
    if item:
        query = query.filter(func.lower(Event.org_name) == item.lower())

    # ✅ Search
    if search:
        query = query.filter(Event.name.ilike(f"%{search}%"))

    # ✅ SORTING LOGIC
    # 1️⃣ Upcoming events first
    # 2️⃣ Past events later
    # 3️⃣ Sorted by date inside each group
    query = query.order_by(
        case(
            (Event.date >= now, 0),  # upcoming → priority 0
            else_=1                  # past → priority 1
        ),
        Event.date.asc()
    )
    all_filtered_events = query.all()
    # ✅ Apply target audience filtering for logged-in users
    if current_user:
        all_filtered_events = [e for e in all_filtered_events if check_user_eligibility(current_user, e)]
    # ✅ Apply Pagination in memory
    paginated_events = all_filtered_events[skip : skip + limit]

    # ✅ Registration status
    registered_ids = set()
    if current_user:
        registered_ids = {r.event_id for r in current_user.registrations}

    for e in paginated_events:
        e.is_registered = e.id in registered_ids

    return paginated_events


# ============================================================
# RECOMMENDATIONS
# ============================================================
@router.get("/recommendations", response_model=List[EventOut])
def get_recommendations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return get_event_recommendations(db, current_user.id)


# ============================================================
# EVENT DETAIL
# ============================================================
@router.get("/{event_id}", response_model=EventDetail)
def get_event_detail(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user:
        event.is_registered = any(
            r.event_id == event_id for r in current_user.registrations
        )
    else:
        event.is_registered = False

    return event


# ============================================================
# REGISTER FOR EVENT
# ============================================================
@router.post("/{event_id}/register")
def register_for_event(
    event_id: int,
    custom_answers: dict = {},
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # 🚫 BLOCK PAST EVENTS
    now = datetime.now(timezone.utc)

    event_date = event.date
    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=timezone.utc)

    if event_date < now:
        raise HTTPException(
            status_code=400,
            detail="Cannot register for past events"
        )

    # ✅ Target Audience Check
    if not check_user_eligibility(current_user, event):
        raise HTTPException(
            status_code=403,
            detail="You are not eligible to register for this event based on its target audience restrictions."
        )

    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already registered")

    db.add(
        Registration(
            user_id=current_user.id,
            event_id=event_id,
            custom_answers=custom_answers
        )
    )
    db.commit()

    return {"status": "success", "msg": "Registered successfully"}


# ============================================================
# DEREGISTER
# ============================================================
@router.delete("/{event_id}/register")
def deregister_from_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Not registered for this event")

    db.delete(registration)
    db.commit()

    return {"status": "success", "msg": "Deregistered successfully"}
