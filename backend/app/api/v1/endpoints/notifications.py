from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.user import User
from app.models.user_device import UserDevice
from app.models.notification import Notification

router = APIRouter()


# ── Save device token ──
@router.post("/device-token")
def save_device_token(
    body: dict,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    token = body.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    existing = db.query(UserDevice).filter(
        UserDevice.user_id == current_user.id,
        UserDevice.device_token == token
    ).first()
    if existing:
        return {"msg": "Token already registered"}

    db.add(UserDevice(user_id=current_user.id, device_token=token))
    db.commit()
    return {"msg": "Token saved"}


# ── List notifications ──
@router.get("/")
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [{
        "id": n.id,
        "title": n.title,
        "body": n.body,
        "redirect": n.redirect,
        "is_read": n.is_read,
        "created_at": n.created_at,
    } for n in notifs]


# ── Unread count ──
@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    count = db.query(func.count(Notification.id)).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).scalar()
    return {"count": count}


# ── Mark all as read ──
@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"msg": "All marked as read"}


# ── Mark single as read ──
@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"msg": "Marked as read"}


# ── Delete single notification ──
@router.delete("/{notif_id}")
def delete_notification(
    notif_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"msg": "Notification deleted"}


# ── Clear all notifications ──
@router.delete("/")
def clear_all_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete()
    db.commit()
    return {"msg": "All notifications cleared"}
