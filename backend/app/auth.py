from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
import os

from . import schemas, models, database

# Config
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Fallback only for local dev if absolutely necessary, but better to enforce env var
    # Or just raise error. For now, let's raise error to be secure.
    if os.getenv("ENV") != "development":
        raise ValueError("SECRET_KEY environment variable is not set")
    SECRET_KEY = "dev_secret_key_only_for_local_testing"
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Validate SECRET_KEY in production
if SECRET_KEY == "supersecretkeyCHANGE_ME_IN_PROD":
    import warnings
    warnings.warn("Using default SECRET_KEY! Set SECRET_KEY environment variable in production!")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Bcrypt has a 72 byte limit for passwords
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        raise ValueError("Password cannot exceed 72 bytes")
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None, user_data: dict = None):
    """
    Create JWT token with optional user metadata
    Args:
        data: Base data (usually {"sub": email})
        expires_delta: Token expiration time
        user_data: Additional user info (is_superuser, is_active, user_id)
    """
    to_encode = data.copy()
    
    # Add user metadata if provided
    if user_data:
        to_encode.update(user_data)
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # Async query to find user
    result = await db.execute(select(models.User).where(models.User.email == token_data.email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(current_user: models.User = Depends(get_current_active_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
