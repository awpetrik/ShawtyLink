from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    current_password: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    full_name: Optional[str] = None
    bio: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserCreateAdmin(UserCreate):
    full_name: Optional[str] = None
    is_superuser: bool = False
    is_active: bool = True

class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class UserDeleteConfirm(BaseModel):
    password: str

# --- URL Schemas ---
class URLBase(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None
    password: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_clicks: Optional[int] = None

class URLCreate(URLBase):
    pass

class URLUpdate(BaseModel):
    original_url: Optional[str] = None
    is_active: Optional[bool] = None
    max_clicks: Optional[int] = None

class URL(URLBase):
    id: int
    short_code: str
    created_at: datetime
    clicks: int
    is_active: bool
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Analytics Schemas ---
class ClickEvent(BaseModel):
    id: int
    timestamp: datetime
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    country: Optional[str] = None
    

    class Config:
        from_attributes = True

class GlobalStats(BaseModel):
    total_users: int
    total_urls: int
    total_clicks: int

class UnlockRequest(BaseModel):
    password: str

