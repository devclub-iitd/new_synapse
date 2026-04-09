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
import secrets
from app.utils.entry_number import parse_entry_number
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

REFRESH_COOKIE_KEY = "refresh_token"
CSRF_COOKIE_KEY = "csrf_token"

def _set_refresh_cookie(response: Response, token: str):
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key=REFRESH_COOKIE_KEY,
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",  # only sent to auth endpoints
    )

def _set_csrf_cookie(response: Response, csrf_token: str):
    """Set a non-httponly CSRF cookie that the frontend can read."""
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key=CSRF_COOKIE_KEY,
        value=csrf_token,
        httponly=False,  # frontend must read this
        secure=is_prod,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

def _verify_csrf(request: Request):
    """Verify that X-CSRF-Token header matches the csrf_token cookie."""
    cookie_token = request.cookies.get(CSRF_COOKIE_KEY)
    header_token = request.headers.get("X-CSRF-Token")
    if not cookie_token or not header_token or cookie_token != header_token:
        raise HTTPException(status_code=403, detail="CSRF validation failed")

@router.post("/login/microsoft", response_model=Token)
@limiter.limit("10/minute")
async def login_microsoft(
    request: Request,
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(deps.get_db)
):
    # 1. Validate Code with Azure
    ms_user = await validate_microsoft_code(login_data.code)
    email = ms_user["email"].lower().strip()
    logger.debug("Microsoft login attempt for domain: %s", email.split("@")[-1])
    
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
    csrf_token = secrets.token_urlsafe(32)
    
    # 5. Set refresh token as HttpOnly cookie + CSRF cookie
    _set_refresh_cookie(response, refresh_token)
    _set_csrf_cookie(response, csrf_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
@limiter.limit("30/minute")
def refresh_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(deps.get_db)
):
    """Use the refresh token cookie to get a new access token."""
    # CSRF check
    _verify_csrf(request)

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
    new_csrf = secrets.token_urlsafe(32)
    _set_refresh_cookie(response, new_refresh)
    _set_csrf_cookie(response, new_csrf)
    
    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    """Clear the refresh token and CSRF cookies."""
    response.delete_cookie(
        key=REFRESH_COOKIE_KEY,
        path="/api/v1/auth",
    )
    response.delete_cookie(
        key=CSRF_COOKIE_KEY,
        path="/",
    )
    return {"detail": "Logged out"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """Fetch the current user with roles."""
    return current_user
