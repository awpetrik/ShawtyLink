from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String, index=True)
    short_code = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # New features
    clicks = Column(Integer, default=0)
    password = Column(String, nullable=True) # Hashed
    expires_at = Column(DateTime, nullable=True)
    max_clicks = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)

    click_events = relationship("ClickEvent", back_populates="url")

class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True, index=True)
    url_id = Column(Integer, ForeignKey("urls.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    country = Column(String, nullable=True) # Placeholder

    url = relationship("URL", back_populates="click_events")
