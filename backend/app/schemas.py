from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class URLBase(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None
    password: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_clicks: Optional[int] = None

class URLCreate(URLBase):
    pass

class ClickEvent(BaseModel):
    timestamp: datetime
    referrer: Optional[str]
    user_agent: Optional[str]
    country: Optional[str]
    
    class Config:
        from_attributes = True

class URL(URLBase):
    id: int
    short_code: str
    created_at: datetime
    clicks: int
    is_active: bool

    class Config:
        from_attributes = True # V2 Config

class URLStats(URL):
    click_events: List[ClickEvent] = []
