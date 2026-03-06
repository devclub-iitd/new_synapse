from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.user import UserOut
from app.schemas.event import EventOut
import uuid
from fastapi import Form, File, UploadFile
import json
from app.services.cloudinary import cloudinary
from app.models.enums import DepartmentName, HostelName

router = APIRouter()

@router.put("/profile", response_model=UserOut)
def update_profile(
    hostel: str = Form(None),
    department: str = Form(None),
    current_year: int = Form(None),
    interests: str = Form(None),
    photo: UploadFile = File(None),
    remove_photo: bool = Form(False),  # ✅ ADD THIS

    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 🔴 REMOVE PHOTO
    if remove_photo:
        current_user.photo_url = None

    # 🟢 UPLOAD NEW PHOTO
    elif photo:
        result = cloudinary.uploader.upload(
            photo.file,
            folder="profiles",
            public_id=str(uuid.uuid4()),
            resource_type="image"
        )
        current_user.photo_url = result["secure_url"]

    # NORMAL FIELDS
    if hostel is not None:
        try:
            current_user.hostel = HostelName(hostel)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid hostel: '{hostel}'. Must be a valid IITD hostel name.")
    if department is not None:
        try:
            current_user.department = DepartmentName(department)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid department: '{department}'. Must be a valid IITD department name.")
    if current_year is not None:
        current_user.current_year = current_year
    if interests is not None:
        current_user.interests = json.loads(interests)

    db.commit()
    db.refresh(current_user)
    return current_user




@router.get("/calendar", response_model=list[EventOut])
def get_my_calendar(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all events the user has registered for."""
    # SQLAlchemy relationship magic
    return [reg.event for reg in current_user.registrations]

