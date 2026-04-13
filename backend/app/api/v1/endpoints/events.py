from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload, subqueryload
from typing import List, Optional
from app.api import deps
from app.models.event import Event
from app.models.organization import Organization
from app.models.user import User
from app.models.registration import Registration
from app.schemas.event import EventOut, EventDetail
from app.services.recommender import get_event_recommendations
from sqlalchemy import or_, func, exists, select
from datetime import datetime, timedelta, timezone
from app.core.timezone import now_utc
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

_SKIP_WORDS = {"of", "the", "and", "for", "in", "on", "at", "to", "a", "an"}

def _org_abbreviation(name: str) -> str:
    """Return the abbreviation for an org name (4+ words), else the full name."""
    if not name:
        return ""
    words = name.strip().split()
    if len(words) < 4:
        return name
    return "".join(w[0].upper() for w in words if w.lower() not in _SKIP_WORDS)

# Board -> org names mapping (mirrors FilterDrawer.jsx)
BOARD_CLUBS_MAPPING = {
    "CAIC": [
        "devclub", "igem", "robotics club", "axlr8r formula racing",
        "physics and astronomy club", "business and consulting club",
        "aeromodelling club", "economics club",
        "algorithms and computing club", "aries", "indian game theory society",
        "blockchain society", "hyperloop club"
    ],
    "BRCA": [
        "dramatics club", "design club", "photography and films club",
        "fine arts and crafts club", "dance club",
        "hindi samiti", "literary club", "debating club", "quizzing club",
        "music club", "spic macay", "envogue"
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
    sort_by: str = Query("date_desc", pattern="^(date_desc|date_asc|popularity)$"),
    org_type: Optional[str] = None,
    board: Optional[str] = None,
    item: Optional[str] = None,
    search: Optional[str] = None,
    genres: Optional[str] = None,
    live: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
):
    now = now_utc()

    query = db.query(Event).options(joinedload(Event.organization))

    # Live filter
    if live is not None:
        query = query.filter(Event.is_live == live)

    # Visibility: show public events + private events from user's orgs
    if current_user and current_user.roles:
        user_org_ids = [r.org_id for r in current_user.roles]
        query = query.filter(
            or_(
                Event.is_private == False,
                Event.org_id.in_(user_org_ids)
            )
        )
    else:
        query = query.filter(Event.is_private == False)

    query = query.filter(Event.date >= now)

    # Org type filter (join to Organization)
    org_joined = False
    if org_type:
        clean_type = normalize_org_type(org_type)
        query = query.join(Event.organization).filter(Organization.org_type == clean_type)
        org_joined = True

    # Board filter
    if board and not item:
        clubs_in_board = BOARD_CLUBS_MAPPING.get(board, [])
        if clubs_in_board:
            if not org_joined:
                query = query.join(Event.organization)
                org_joined = True
            query = query.filter(
                func.lower(Organization.name).in_(clubs_in_board)
            )

    # Specific org name filter
    if item:
        if not org_joined:
            query = query.join(Event.organization)
        query = query.filter(
            func.lower(Organization.name) == item.lower()
        )

    # Search
    if search:
        if not org_joined:
            query = query.join(Event.organization)
            org_joined = True
        # Find orgs whose abbreviation starts with the search term
        search_lower = search.strip().lower()
        abbrev_org_ids = [
            o.id for o in db.query(Organization).all()
            if _org_abbreviation(o.name).lower().startswith(search_lower)
        ]
        search_conditions = [
            Event.name.ilike(f"%{search}%"),
            Organization.name.ilike(f"%{search}%"),
        ]
        if abbrev_org_ids:
            search_conditions.append(Event.org_id.in_(abbrev_org_ids))
        query = query.filter(or_(*search_conditions))

    # Genres filter — Python-level filtering on JSON array
    if genres:
        genre_set = {g.strip().lower() for g in genres.split(",") if g.strip()}
    else:
        genre_set = None

    if sort_by == "date_asc":
        query = query.order_by(Event.date.asc())
    else:
        query = query.order_by(Event.date.desc())

    # Apply eligibility filter in Python only for logged-in users with target audience
    all_filtered_events = query.all()

    if current_user:
        all_filtered_events = [e for e in all_filtered_events if check_user_eligibility(current_user, e)]

    # Genre filter (Python-level on JSON array)
    if genre_set:
        all_filtered_events = [
            e for e in all_filtered_events
            if e.genres and any(g.lower() in genre_set for g in e.genres)
        ]

    paginated_events = all_filtered_events[skip: skip + limit]

    # Batch-fetch registered event IDs in a single query instead of loading all registrations
    if current_user:
        registered_ids = set(
            r[0] for r in db.query(Registration.event_id).filter(
                Registration.user_id == current_user.id,
                Registration.event_id.in_([e.id for e in paginated_events])
            ).all()
        )
    else:
        registered_ids = set()

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
    event = db.query(Event).options(joinedload(Event.organization)).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user:
        event.is_registered = db.query(
            exists().where(Registration.user_id == current_user.id).where(Registration.event_id == event_id)
        ).scalar()
    else:
        event.is_registered = False

    return event


# ============================================================
# TOGGLE LIVE STATUS
# ============================================================
@router.patch("/{event_id}/live")
def toggle_event_live(
    event_id: int,
    body: dict,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check permission: superuser or org member
    if not current_user.is_superuser:
        user_org_ids = [r.org_id for r in (current_user.roles or [])]
        if event.org_id not in user_org_ids:
            raise HTTPException(status_code=403, detail="Not authorized")

    is_live = body.get("is_live")
    if is_live is None:
        raise HTTPException(status_code=400, detail="is_live field required")

    event.is_live = bool(is_live)
    db.commit()
    return {"is_live": event.is_live}


# ============================================================
# REGISTER FOR EVENT
# ============================================================
@router.post("/{event_id}/register")
@limiter.limit("20/minute")
def register_for_event(
    request: Request,
    event_id: int,
    custom_answers: dict = {},
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    now = now_utc()

    event_date = event.date
    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=timezone.utc)

    if event_date < now:
        raise HTTPException(status_code=400, detail="Cannot register for past events")

    if event.registration_deadline:
        deadline = event.registration_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if deadline < now:
            raise HTTPException(status_code=400, detail="Registration deadline has passed for this event")

    if not check_user_eligibility(current_user, event):
        raise HTTPException(status_code=403, detail="You are not eligible to register for this event based on its target audience restrictions.")

    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already registered")

    db.add(Registration(user_id=current_user.id, event_id=event_id, custom_answers=custom_answers))
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
@limiter.limit("10/minute")
def submit_feedback(
    request: Request,
    event_id: int,
    body: dict,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
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
