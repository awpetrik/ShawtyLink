from fastapi import FastAPI, Depends, HTTPException, status, Request, Header
from typing import List
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, update, delete
from fastapi.middleware.cors import CORSMiddleware
import string
import random
import re
from datetime import datetime, timedelta
import os
import redis.asyncio as redis

from . import models, schemas, database, auth

app = FastAPI()

# Input Validation
from pydantic import ValidationError

# CORS - Configure allowed origins properly
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:1603,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis Config
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None

@app.on_event("startup")
async def startup_event():
    # 1. Initialize Redis
    global redis_client
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    
    # 2. Create Tables (Async)
    async with database.engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
        
    # 3. Seed Admin User
    async with database.AsyncSessionLocal() as db:
        admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "admin@shawty.link")
        result = await db.execute(select(models.User).where(models.User.email == admin_email))
        admin = result.scalars().first()
        
        if not admin:
            print(f"Seeding Admin User: {admin_email}")
            hashed_pwd = auth.get_password_hash(os.getenv("INITIAL_ADMIN_PASSWORD", "admin123"))
            new_admin = models.User(
                email=admin_email,
                hashed_password=hashed_pwd,
                is_superuser=True,
                is_active=True
            )
            db.add(new_admin)
            await db.commit()

@app.on_event("shutdown")
async def shutdown_event():
    global redis_client
    if redis_client:
        await redis_client.close()

# --- Auth Routes ---

@app.post("/auth/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.post("/auth/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Include user metadata in token
    return {
        "access_token": auth.create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires,
            user_data={
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
                "user_id": user.id
            }
        ),
        "token_type": "bearer"
    }

@app.post("/auth/forgot-password")
async def forgot_password(
    request: schemas.PasswordResetRequest,
    db: AsyncSession = Depends(database.get_db)
):
    # 1. Check if user exists
    result = await db.execute(select(models.User).where(models.User.email == request.email))
    user = result.scalars().first()
    
    if user:
        # 2. Generate Token
        reset_token = auth.create_random_token()
        
        # 3. Store in Redis (15 mins)
        if redis_client:
            await redis_client.set(f"pwd_reset:{reset_token}", user.email, ex=900)
            
            # 4. Send Email via SMTP
            from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
            from .email_utils import get_reset_password_template
            
            conf = ConnectionConfig(
                MAIL_USERNAME=os.getenv("EMAIL_USER"),
                MAIL_PASSWORD=os.getenv("EMAIL_PASSWORD"),
                MAIL_FROM=os.getenv("EMAIL_FROM", "noreply@shawty.link"),
                MAIL_PORT=int(os.getenv("EMAIL_PORT", 587)),
                MAIL_SERVER=os.getenv("EMAIL_HOST", "smtp.gmail.com"),
                MAIL_STARTTLS=True,
                MAIL_SSL_TLS=False,
                USE_CREDENTIALS=True,
                VALIDATE_CERTS=True
            )
            
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:1603")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"
            
            html = get_reset_password_template(reset_link, user.email, frontend_url)
            
            message = MessageSchema(
                subject="Reset Your Password - ShawtyLink",
                recipients=[user.email],
                body=html,
                subtype=MessageType.html
            )
            
            fm = FastMail(conf)
            try:
                await fm.send_message(message)
            except Exception as e:
                print(f"Failed to send email: {e}")
                # Fallback to log for debugging if SMTP fails
                print(f" [Link] {reset_link}")
                
        else:
            raise HTTPException(500, "Redis unavailable for password reset")
            
    # Check if SMTP is configured (for frontend Dev Note)
    smtp_configured = bool(os.getenv("EMAIL_USER") and os.getenv("EMAIL_PASSWORD"))
    
    return {
        "message": "If the email exists, a reset link has been sent.",
        "smtp_configured": smtp_configured
    }

@app.post("/auth/reset-password")
async def reset_password(
    data: schemas.PasswordResetConfirm,
    db: AsyncSession = Depends(database.get_db)
):
    if not redis_client:
        raise HTTPException(500, "Service unavailable")
        
    # 1. Verify Token
    email = await redis_client.get(f"pwd_reset:{data.token}")
    if not email:
        raise HTTPException(400, "Invalid or expired token")
        
    # 2. Get User
    result = await db.execute(select(models.User).where(models.User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # 3. Update Password
    user.hashed_password = auth.get_password_hash(data.new_password)
    db.add(user)
    await db.commit()
    
    # 4. Delete Token
    await redis_client.delete(f"pwd_reset:{data.token}")
    
    return {"message": "Password updated successfully"}

# --- Admin Routes ---

@app.get("/admin/users", response_model=List[schemas.User], dependencies=[Depends(auth.get_current_active_superuser)])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(database.get_db)
):
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()

@app.get("/admin/stats", response_model=schemas.GlobalStats, dependencies=[Depends(auth.get_current_active_superuser)])
async def read_global_stats(db: AsyncSession = Depends(database.get_db)):
    # Total Users
    user_count_query = select(func.count(models.User.id))
    user_count_res = await db.execute(user_count_query)
    total_users = user_count_res.scalar()

    # Total URLs
    url_count_query = select(func.count(models.URL.id))
    url_count_res = await db.execute(url_count_query)
    total_urls = url_count_res.scalar()

    # Total Clicks
    click_count_query = select(func.count(models.ClickEvent.id))
    click_count_res = await db.execute(click_count_query)
    total_clicks = click_count_res.scalar()
    
    return schemas.GlobalStats(
        total_users=total_users or 0, 
        total_urls=total_urls or 0, 
        total_clicks=total_clicks or 0
    )


@app.post("/admin/users", response_model=schemas.User, dependencies=[Depends(auth.get_current_active_superuser)])
async def create_user_admin(
    user_in: schemas.UserCreateAdmin, 
    db: AsyncSession = Depends(database.get_db)
):
    # Check if email exists
    result = await db.execute(select(models.User).where(models.User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email, 
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.patch("/admin/users/{user_id}", response_model=schemas.User, dependencies=[Depends(auth.get_current_active_superuser)])
async def update_user_admin(
    user_id: int,
    user_in: schemas.UserUpdateAdmin,
    db: AsyncSession = Depends(database.get_db)
):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_in.dict(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        hashed_password = auth.get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.delete("/admin/users/{user_id}", status_code=204, dependencies=[Depends(auth.get_current_active_superuser)])
async def delete_user_admin(
    user_id: int,
    db: AsyncSession = Depends(database.get_db)
):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(db_user)
    await db.commit()
    return None

import csv
import io
from fastapi.responses import StreamingResponse

@app.get("/admin/reports/csv", dependencies=[Depends(auth.get_current_active_superuser)])
async def get_admin_csv_report(db: AsyncSession = Depends(database.get_db)):
    # Query all URLs joined with User
    stmt = (
        select(models.URL, models.User.email, models.User.full_name)
        .join(models.User, models.URL.user_id == models.User.id)
        .order_by(desc(models.URL.created_at))
    )
    result = await db.execute(stmt)
    rows = result.all() # [(URL, email, full_name), ...]

    # Create CSV Stream
    def iter_csv():
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Created At", 
            "Owner Email", 
            "Owner Name", 
            "Short Code", 
            "Original URL", 
            "Clicks", 
            "Status"
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in rows:
            url_obj, email, full_name = row
            writer.writerow([
                url_obj.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                email,
                full_name or "N/A",
                url_obj.short_code,
                url_obj.original_url,
                url_obj.clicks,
                "Active" if url_obj.is_active else "Inactive"
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    headers = {
        "Content-Disposition": f"attachment; filename=shawty_report_{datetime.now().strftime('%Y%m%d')}.csv"
    }
    return StreamingResponse(iter_csv(), media_type="text/csv", headers=headers)



@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.put("/users/update", response_model=schemas.User)
async def update_user(
    user_in: schemas.UserUpdate, 
    db: AsyncSession = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Verify password if changing sensitive info like email or password
    if user_in.current_password:
        if not auth.verify_password(user_in.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect current password")
    elif user_in.password:
        # If trying to set new password without current pass confirmation
        raise HTTPException(status_code=400, detail="Current password required to change password")

    if user_in.email and user_in.email != current_user.email:
        # Check email uniqueness
        result = await db.execute(select(models.User).where(models.User.email == user_in.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_in.email

    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    if user_in.bio is not None:
        current_user.bio = user_in.bio
        
    if user_in.password:
        current_user.hashed_password = auth.get_password_hash(user_in.password)
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@app.delete("/users/me", status_code=204)
async def delete_user_me(
    user_confirm: schemas.UserDeleteConfirm,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # 1. Verify Password
    if not auth.verify_password(user_confirm.password, current_user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    # 2. Delete User's URLs (Clicks cascade from URL)
    # Using bulk delete for efficiency
    await db.execute(delete(models.URL).where(models.URL.user_id == current_user.id))
    
    # 3. Delete User
    await db.execute(delete(models.User).where(models.User.id == current_user.id))
    
    # 4. Commit
    await db.commit()
    
    return None

# --- Analytics Routes (Dynamic) ---

@app.get("/analytics/dashboard")
async def get_user_analytics(
    time_range: str = "7d", 
    db: AsyncSession = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    days = 7
    if time_range == "24h": days = 1
    elif time_range == "30d": days = 30
    elif time_range == "90d": days = 90
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Get User's URLs IDs
    user_urls_res = await db.execute(select(models.URL.id).where(models.URL.user_id == current_user.id))
    user_url_ids = user_urls_res.scalars().all()
    
    if not user_url_ids:
        # No links, no stats
        return {
            "chart_data": [],
            "top_referrers": [],
            "top_devices": [],
            "top_countries": [],
            "top_links": [],
            "total_clicks": 0,
            "avg_ctr": 0
        }
    
    # 2. Chart Data (Total Clicks over time)
    # Filter ClickEvents where url_id in user_url_ids AND timestamp >= start_date
    # Note: Postgres uses to_char. SQLite uses strftime.
    # Production uses Postgres, so we use to_char.
    date_col = func.to_char(models.ClickEvent.timestamp, 'YYYY-MM-DD')
    # Note: SQLite uses %Y-%m-%d. For Postgres use to_char. Assuming SQLite for now based on context.
    
    q_chart = (
        select(date_col, func.count(models.ClickEvent.id))
        .where(models.ClickEvent.url_id.in_(user_url_ids))
        .where(models.ClickEvent.timestamp >= start_date)
        .group_by(date_col)
        .order_by(date_col)
    )
    
    chart_res = await db.execute(q_chart)
    chart_rows = chart_res.all()
    chart_dict = {r[0]: r[1] for r in chart_rows}
    
    chart_data = []
    # Fill gaps
    for i in range(days + 1):
        if time_range == "24h":
            # Hourly granularity not implemented for brevity, sticking to daily or fallback
            pass 
        d = (datetime.utcnow() - timedelta(days=days - i)).strftime("%Y-%m-%d")
        chart_data.append({"date": d, "clicks": chart_dict.get(d, 0)})

    # Helper for Top Lists
    async def get_top(col, limit=5):
        q = (
            select(col, func.count(models.ClickEvent.id))
            .where(models.ClickEvent.url_id.in_(user_url_ids))
            .where(models.ClickEvent.timestamp >= start_date)
            .group_by(col)
            .order_by(desc(func.count(models.ClickEvent.id)))
            .limit(limit)
        )
        res = await db.execute(q)
        return [{"name": r[0] or "Direct/Unknown", "value": r[1]} for r in res.all()]

    return {
        "chart_data": chart_data,
        "top_referrers": await get_top(models.ClickEvent.referrer),
        "top_devices": await get_top(models.ClickEvent.user_agent),
        "top_countries": await get_top(models.ClickEvent.country),
        "top_links": (await db.execute(select(models.URL).where(models.URL.user_id == current_user.id).order_by(desc(models.URL.clicks)).limit(5))).scalars().all()
    }


# --- URL Routes ---

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.post("/shorten_auth", response_model=schemas.URL)
async def create_short_url_auth(
    url_in: schemas.URLCreate, 
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return await create_short_url_impl(url_in, db, current_user.id)

@app.post("/shorten", response_model=schemas.URL)
async def create_short_url_public(
    url_in: schemas.URLCreate, 
    request: Request,
    db: AsyncSession = Depends(database.get_db)
):
    # Rate Limiting for Guests
    client_ip = request.client.host
    rate_limit_key = f"rate_limit:{client_ip}"
    
    if redis_client:
        current_count = await redis_client.get(rate_limit_key)
        if current_count and int(current_count) >= 5:
             raise HTTPException(status_code=429, detail="Rate limit exceeded. Please Sign Up for unlimited links.")
        
        # Increment and set expire if new
        pipe = redis_client.pipeline()
        pipe.incr(rate_limit_key)
        if not current_count:
            pipe.expire(rate_limit_key, 2592000) # 30 Days (1 Month)
        await pipe.execute()

    # Public endpoint - no user tracking
    return await create_short_url_impl(url_in, db, None)

from typing import Optional

async def create_short_url_impl(url_in: schemas.URLCreate, db: AsyncSession, user_id: Optional[int]):
    # Reserved words
    RESERVED_WORDS = {'admin', 'verify', 'login', 'dashboard', 'api', 'auth', 'check', 'unlock', 'shorten', 'analytics', 'settings', 'register', 'links'}
    
    if url_in.custom_alias:
        if not re.match(r'^[a-zA-Z0-9-_]+$', url_in.custom_alias):
            raise HTTPException(status_code=400, detail="Alias alphanumeric only")
        if url_in.custom_alias.lower() in RESERVED_WORDS:
            raise HTTPException(status_code=400, detail="Reserved alias")
        
        # Uniqueness
        res = await db.execute(select(models.URL).where(models.URL.short_code == url_in.custom_alias))
        if res.scalars().first():
             raise HTTPException(status_code=400, detail="Alias taken")
        short_code = url_in.custom_alias
    else:
        short_code = generate_short_code()
        while True:
            res = await db.execute(select(models.URL).where(models.URL.short_code == short_code))
            if not res.scalars().first(): break
            short_code = generate_short_code()

    db_url = models.URL(
        original_url=url_in.original_url,
        short_code=short_code,
        password=url_in.password,
        expires_at=url_in.expires_at,
        max_clicks=url_in.max_clicks,
        user_id=user_id
    )
    db.add(db_url)
    await db.commit()
    await db.refresh(db_url)
    return db_url

# --- User URL Management Routes ---

@app.get("/urls", response_model=list[schemas.URL])
async def get_user_urls(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = (
        select(models.URL)
        .where(models.URL.user_id == current_user.id)
        .order_by(desc(models.URL.created_at))
        .offset(skip)
        .limit(limit)
    )
    res = await db.execute(query)
    return res.scalars().all()

@app.delete("/urls/{short_code}")
async def delete_user_url(
    short_code: str,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check ownership
    res = await db.execute(select(models.URL).where(models.URL.short_code == short_code, models.URL.user_id == current_user.id))
    db_url = res.scalars().first()
    
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found or access denied")
        
    await db.delete(db_url)
    await db.commit()
    
    # Invalidate Cache
    if redis_client:
        await redis_client.delete(f"url:{short_code}")
        
    return {"message": "URL deleted successfully"}

@app.put("/urls/{short_code}", response_model=schemas.URL)
async def update_user_url(
    short_code: str,
    url_update: schemas.URLUpdate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    res = await db.execute(select(models.URL).where(models.URL.short_code == short_code, models.URL.user_id == current_user.id))
    db_url = res.scalars().first()
    
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")
        
    if url_update.original_url:
        db_url.original_url = url_update.original_url
        # Update Cache
        if redis_client:
            await redis_client.set(f"url:{short_code}", url_update.original_url, ex=3600)
            
    if url_update.is_active is not None:
        db_url.is_active = url_update.is_active
        if not url_update.is_active and redis_client:
             await redis_client.delete(f"url:{short_code}")
             
    if url_update.max_clicks and url_update.max_clicks > 0:
        db_url.max_clicks = url_update.max_clicks
        
    db.add(db_url)
    await db.commit()
    await db.refresh(db_url)
    return db_url

from fastapi import BackgroundTasks
import httpx
from user_agents import parse

# Helper to extract real client IP behind proxy
def get_client_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        # X-Forwarded-For can be a comma-separated list, first one is the client
        return x_forwarded_for.split(",")[0].strip()
    return request.headers.get("x-real-ip") or request.client.host

# Background Task for Enriching Analytics
async def process_click_stats(click_id: int, user_agent_str: str, client_ip: str):
    async with database.AsyncSessionLocal() as db:
        # 1. Parse User Agent
        ua = parse(user_agent_str)
        device = f"{ua.browser.family} on {ua.os.family}"
        
        # 2. GeoIP Lookup
        country = "Unknown"
        
        # Filter Local/Private IPs
        # Docker internal IPs usually start with 172. or 10. or 192.168.
        is_private = client_ip.startswith(("127.", "::1", "10.", "172.", "192.168."))
        
        if is_private or client_ip == "localhost":
            country = "Indonesia (Dev)" # Treat all private/local IPs as Dev Country
        else:
            try:
                # Use public IP-API (free, limit 45 req/min)
                async with httpx.AsyncClient() as client:
                    resp = await client.get(f"http://ip-api.com/json/{client_ip}", timeout=3.0)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("status") == "success":
                            country = data.get("country", "Unknown")
                            
            except Exception as e:
                print(f"GeoIP Failed: {e}")

        # 3. Update ClickEvent
        await db.execute(
            update(models.ClickEvent)
            .where(models.ClickEvent.id == click_id)
            .values(user_agent=device, country=country)
        )
        await db.commit()

@app.get("/{short_code}")
async def redirect_to_url(
    short_code: str, 
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db),
    user_agent: str = Header("Unknown")
):
    if redis_client:
        cached = await redis_client.get(f"url:{short_code}")
        if cached: return RedirectResponse(cached)

    res = await db.execute(select(models.URL).where(models.URL.short_code == short_code))
    db_url = res.scalars().first()
    
    if not db_url: raise HTTPException(404, detail="URL not found")
    
    if not db_url.is_active: raise HTTPException(410, "Inactive")
    
    # Check expiration
    if db_url.expires_at:
        from datetime import datetime
        if db_url.expires_at < datetime.utcnow():
            raise HTTPException(410, "Link expired")
    
    # Check max clicks
    if db_url.max_clicks and db_url.clicks >= db_url.max_clicks:
        raise HTTPException(410, "Maximum clicks reached")
    
    if db_url.password:
        # Redirect to frontend unlock page
        # Using a special prefix or just relying on frontend routing. 
        # Since we use HashRouter or BrowserRouter, simple 307 redirect might change method.
        # Let's return 307 to frontend /unlock path
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/unlock/{short_code}")
    
    # Initial Log (Fast)
    click = models.ClickEvent(
        url_id=db_url.id, 
        referrer=request.headers.get("referer") or "Direct", 
        user_agent=user_agent, # Raw first
        country="Processing..." # Placeholder
    )
    db.add(click)
    await db.execute(update(models.URL).where(models.URL.id == db_url.id).values(clicks=models.URL.clicks + 1))
    await db.commit()
    await db.refresh(click) # Get ID
    
    # Async Enrichment
    client_ip = get_client_ip(request)
    background_tasks.add_task(process_click_stats, click.id, user_agent, client_ip)
    
    
    if redis_client: await redis_client.set(f"url:{short_code}", db_url.original_url, ex=3600)
    
    return RedirectResponse(db_url.original_url)

@app.post("/unlock/{short_code}")
async def unlock_url(
    short_code: str,
    unlock: schemas.UnlockRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db),
    user_agent: str = Header("Unknown")
):
    res = await db.execute(select(models.URL).where(models.URL.short_code == short_code))
    db_url = res.scalars().first()
    
    if not db_url or not db_url.is_active:
        raise HTTPException(404, "Link not found")
    
    # Check expiration
    if db_url.expires_at:
        from datetime import datetime
        if db_url.expires_at < datetime.utcnow():
            raise HTTPException(410, "Link expired")
    
    # Check max clicks
    if db_url.max_clicks and db_url.clicks >= db_url.max_clicks:
        raise HTTPException(410, "Maximum clicks reached")
        
    if db_url.password and db_url.password != unlock.password:
        raise HTTPException(403, "Incorrect password")
        
    # Log Click (Authenticated by password)
    click = models.ClickEvent(
        url_id=db_url.id, 
        referrer=request.headers.get("referer") or "Direct (Password)", 
        user_agent=user_agent, 
        country="Processing..."
    )
    db.add(click)
    await db.execute(update(models.URL).where(models.URL.id == db_url.id).values(clicks=models.URL.clicks + 1))
    await db.commit()
    await db.refresh(click)
    
    # Async Enrichment
    client_ip = get_client_ip(request)
    background_tasks.add_task(process_click_stats, click.id, user_agent, client_ip)
    
    return {"original_url": db_url.original_url}

@app.get("/check/{slug}")
async def check_slug(slug: str, db: AsyncSession = Depends(database.get_db)):
    res = await db.execute(select(models.URL).where(models.URL.short_code == slug))
    return {"available": not res.scalars().first()}

# Legacy /dashboard/stats for compatibility (or refactor frontend to use new endpoint)
@app.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Existing minimal stats
    my_urls = (await db.execute(select(models.URL).where(models.URL.user_id == current_user.id).order_by(desc(models.URL.created_at)).limit(10))).scalars().all()
    total = (await db.execute(select(func.sum(models.URL.clicks)).where(models.URL.user_id == current_user.id))).scalar() or 0
    count = (await db.execute(select(func.count(models.URL.id)).where(models.URL.user_id == current_user.id))).scalar() or 0
    
    return {
        "total_clicks": total,
        "active_links": count,
        "recent_links": my_urls
    }
