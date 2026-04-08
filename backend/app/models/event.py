from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)

    # Core
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    registration_deadline = Column(DateTime, nullable=True)
    venue = Column(String, nullable=False)
    image_url = Column(String, nullable=True)

    # Organization FK (replaces org_name + org_type columns)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)

    event_manager_email = Column(String, nullable=False)

    # Metadata
    tags = Column(JSON, default=list)
    target_audience = Column(JSON, default=dict)
    is_private = Column(Boolean, default=False, index=True)
    custom_form_schema = Column(JSON, default=list)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="events")
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")