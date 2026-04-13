from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid


class EventRequest(Base):
    __tablename__ = "event_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    status = Column(Integer, default=0)  # -1=rejected, 0=pending, 1=accepted
    form_response = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    event = relationship("Event", backref="requests")
    organization = relationship("Organization")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint('user_id', 'event_id', name='_user_event_request_uc'),
        CheckConstraint('status >= -1 AND status <= 1', name='check_request_status'),
    )
