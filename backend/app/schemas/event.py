from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.user import OrgBrief


class EventBase(BaseModel):
    name: str
    description: str
    date: datetime
    registration_deadline: Optional[datetime] = None
    venue: str
    org_id: int
    tags: List[str] = []
    is_private: bool = False


class EventCreate(EventBase):
    target_audience: Optional[Dict[str, Any]] = {}
    custom_form_schema: Optional[List[Dict[str, Any]]] = []
    image_url: Optional[str] = None


class EventOut(BaseModel):
    id: int
    name: str
    description: str
    date: datetime
    registration_deadline: Optional[datetime] = None
    venue: str
    org_id: int
    organization: OrgBrief
    tags: List[str] = []
    is_private: bool = False
    image_url: Optional[str] = None
    is_registered: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    target_audience: Optional[Dict[str, Any]] = {}

    class Config:
        from_attributes = True


class EventDetail(EventOut):
    custom_form_schema: List[Dict[str, Any]] = []