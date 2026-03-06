from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
from app.schemas.event import EventOut, EventDetail
from app.services.recommender import get_event_recommendations
from sqlalchemy import func, case, String
from datetime import datetime, timedelta, timezone
from app.core.timezone import IST, now_ist

router = APIRouter()

# Board → clubs mapping (mirrors FilterDrawer.jsx)
BOARD_CLUBS_MAPPING = {
    "CAIC": [
        "DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing",
        "PAC", "BnC", "Aeromodelling Club", "Economics Club",
        "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"
    ],
    "BRCA": [
        "Drama", "Design", "PFC", "FACC", "Dance",
        "Hindi Samiti", "Literary", "DebSoc", "QC",
        "Music", "Spic Macay", "Envogue"
    ]
}

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
    board: Optional[str] = None,       # ✅ NEW: board filter param
    item: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    now = now_ist()

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

    query = query.filter(Event.date >= now)

    # ✅ Org type filter
    if org_type:
        clean_type = normalize_org_type(org_type)
        query = query.filter(Event.org_type == clean_type)

    # ✅ FIX: Board filter — cast to String first (org_name is a Postgres Enum)
    if board and not item:
        clubs_in_board = BOARD_CLUBS_MAPPING.get(board, [])
        if clubs_in_board:
            query = query.filter(
                func.lower(Event.org_name.cast(String)).in_([c.lower() for c in clubs_in_board])
            )

    # ✅ Org name (item) filter — cast to String before lower()
    if item:
        query = query.filter(func.lower(Event.org_name.cast(String)) == item.lower())

    # ✅ Search
    if search:
        query = query.filter(Event.name.ilike(f"%{search}%"))

    query = query.order_by(
        case(
            (Event.date >= now, 0),
            else_=1
        ),
        Event.date.asc()
    )
    all_filtered_events = query.all()

    if current_user:
        all_filtered_events = [e for e in all_filtered_events if check_user_eligibility(current_user, e)]

    paginated_events = all_filtered_events[skip : skip + limit]

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

    now = now_ist()

    event_date = event.date
    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=IST)

    if event_date < now:
        raise HTTPException(
            status_code=400,
            detail="Cannot register for past events"
        )

    # 🚫 BLOCK IF REGISTRATION DEADLINE PASSED
    if event.registration_deadline:
        deadline = event.registration_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=IST)
        if deadline < now:
            raise HTTPException(
                status_code=400,
                detail="Registration deadline has passed for this event"
            )

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


# ============================================================
# FEEDBACK
# ============================================================
@router.post("/{event_id}/feedback")
def submit_feedback(
    event_id: int,
    body: dict,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Submit a 1-10 rating for an event the user registered for."""
    rating = body.get("rating")
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 10:
        raise HTTPException(status_code=422, detail="Rating must be an integer between 1 and 10")

    registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="You are not registered for this event")

    if registration.feedback_rating:
        raise HTTPException(status_code=400, detail="You have already submitted feedback for this event")

    registration.feedback_rating = rating
    db.commit()

    return {"status": "success", "msg": "Feedback submitted"}