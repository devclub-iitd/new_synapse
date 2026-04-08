from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    role_name = Column(String, nullable=False)

    # Relationships
    user = relationship("User", back_populates="roles")
    organization = relationship("Organization", back_populates="roles")

    __table_args__ = (
        UniqueConstraint("user_id", "org_id", "role_name", name="uq_user_org_role"),
    )
