from fastapi import APIRouter, Depends, HTTPException, Body, Response, Request, Cookie
from sqlalchemy.orm import Session
from app.api import deps
from app.services.microsoft_auth import validate_microsoft_code
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token, ALGORITHM
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.auth import LoginRequest
from app.schemas.user import UserOut  
from jose import jwt, JWTError
import logging
from app.utils.entry_number import parse_entry_number
logger = logging.getLogger(__name__)
router = APIRouter()

REFRESH_COOKIE_KEY = "refresh_token"

def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_KEY,
        value=token,
        httponly=True,
        secure=False,       # set True in production (HTTPS)
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",  # only sent to auth endpoints
    )

@router.post("/login/microsoft", response_model=Token)
async def login_microsoft(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(deps.get_db)
):
    # 1. Validate Code with Azure
    ms_user = await validate_microsoft_code(login_data.code)
    email = ms_user["email"].lower().strip()
    logger.error({
    	"email": ms_user.get("email"),
    	"preferred_username": ms_user.get("preferred_username"),
    	"upn": ms_user.get("upn"),
	"tid": ms_user.get("tid"),
    })
    
    # 2. Check Domain
    if not (email.endswith("@csciitd.onmicrosoft.com") or email.endswith("@iitd.onmicrosoft.com") or email.endswith("@iitd.ac.in")):

        raise HTTPException(status_code=400, detail="Only @iitd.ac.in emails allowed")

    # 3. Check DB
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        entry_number = email.split("@")[0].upper()         
        dept, year = parse_entry_number(entry_number)
        user = User(
            email=email,
            name=ms_user["name"],
            entry_number=entry_number,
            department=dept,
            current_year=year
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Refresh year on every login
        _, year = parse_entry_number(user.entry_number or "")
        if year and user.current_year != year:
            user.current_year = year
            db.commit()
            db.refresh(user)
        
    # 4. Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    # 5. Set refresh token as HttpOnly cookie
    _set_refresh_cookie(response, refresh_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
def refresh_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(deps.get_db)
):
    """Use the refresh token cookie to get a new access token."""
    token = request.cookies.get(REFRESH_COOKIE_KEY)
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Issue new pair
    new_access = create_access_token(subject=user.id)
    new_refresh = create_refresh_token(subject=user.id)
    _set_refresh_cookie(response, new_refresh)
    
    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    """Clear the refresh token cookie."""
    response.delete_cookie(
        key=REFRESH_COOKIE_KEY,
        path="/api/v1/auth",
    )
    return {"detail": "Logged out"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """Fetch the current user with roles."""
    return current_user
