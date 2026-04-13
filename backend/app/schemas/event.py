from pydantic import BaseModel, model_validator
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
    genres: List[str] = []
    is_private: bool = False
    duration_hours: Optional[float] = None


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
    genres: List[str] = []
    is_private: bool = False
    image_url: Optional[str] = None
    is_registered: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    target_audience: Optional[Dict[str, Any]] = {}
    duration_hours: Optional[float] = None
    event_manager_email: Optional[str] = None

    class Config:
        from_attributes = True

    @model_validator(mode="after")
    def fallback_image(self):
        if not self.image_url and self.organization:
            self.image_url = self.organization.banner_url
        return self


class EventDetail(EventOut):
    custom_form_schema: List[Dict[str, Any]] = []