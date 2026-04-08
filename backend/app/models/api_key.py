from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    key_hash = Column(String, nullable=False, unique=True, index=True)
    key_prefix = Column(String(8), nullable=False)  # first 8 chars for identification
    label = Column(String, nullable=False, default="default")
    is_active = Column(Boolean, default=True, index=True)
    allowed_ips = Column(JSON, default=list)  # optional IP whitelist
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", backref="api_keys")
