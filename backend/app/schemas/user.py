from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.enums import RoleName, DepartmentName, HostelName


# --- Organization (nested in role) ---
class OrgBrief(BaseModel):
    id: int
    name: str
    org_type: str
    banner_url: Optional[str] = None
    genres: Optional[str] = None

    class Config:
        from_attributes = True


# --- Role Schemas ---
class RoleOut(BaseModel):
    id: int
    org_id: int
    role_name: str
    organization: OrgBrief

    class Config:
        from_attributes = True


class RoleCreate(BaseModel):
    org_id: int
    role_name: RoleName


# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    entry_number: Optional[str] = None
    department: Optional[DepartmentName] = None
    hostel: Optional[HostelName] = None
    interests: List[str] = []
    current_year: Optional[int] = None


class UserUpdate(BaseModel):
    interests: Optional[List[str]] = None
    photo_url: Optional[str] = None
    department: Optional[DepartmentName] = None
    hostel: Optional[HostelName] = None
    current_year: Optional[int] = None


class UserOut(UserBase):
    id: int
    photo_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None

    roles: List[RoleOut] = []

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: List[UserOut]
    total: int


# --- Team Management Schema ---
class TeamMemberCreate(BaseModel):
    email: EmailStr
    role: RoleName