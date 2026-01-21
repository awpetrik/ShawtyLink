from fastapi import FastAPI, Depends, HTTPException, status, Request, Header
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi.middleware.cors import CORSMiddleware
import string
import random
from datetime import datetime
from typing import Optional

from . import models, schemas, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.post("/shorten", response_model=schemas.URL)
def create_short_url(url: schemas.URLCreate, db: Session = Depends(get_db)):
    if url.custom_alias:
        if db.query(models.URL).filter(models.URL.short_code == url.custom_alias).first():
            raise HTTPException(status_code=400, detail="Alias already taken")
        short_code = url.custom_alias
    else:
        short_code = generate_short_code()
        while db.query(models.URL).filter(models.URL.short_code == short_code).first():
            short_code = generate_short_code()

    # Password should be hashed in production, storing plain for simplicity now or mock hash
    # For a real app, use passlib.hash.bcrypt
    db_url = models.URL(
        original_url=url.original_url, 
        short_code=short_code,
        password=url.password, # Plaintext for this demo, usually Hash!
        expires_at=url.expires_at,
        max_clicks=url.max_clicks
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url

@app.post("/unlock")
def unlock_url(body: dict, db: Session = Depends(get_db)):
    short_code = body.get("short_code")
    password = body.get("password")
    
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")
        
    if db_url.password != password:
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    return {"original_url": db_url.original_url}

@app.get("/check/{slug}")
def check_slug_availability(slug: str, db: Session = Depends(get_db)):
    exists = db.query(models.URL).filter(models.URL.short_code == slug).first()
    return {"available": not exists}

from datetime import timedelta

@app.get("/admin/analytics/overview")
def get_analytics_overview(time_range: str = "7d", db: Session = Depends(get_db)):
    days = 7
    if time_range == "14d": days = 14
    elif time_range == "30d": days = 30
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Clicks per day
    # SQLite specific date formatting
    date_trunc = func.strftime("%Y-%m-%d", models.ClickEvent.timestamp)
    
    clicks_daily = db.query(date_trunc, func.count(models.ClickEvent.id))\
        .filter(models.ClickEvent.timestamp >= start_date)\
        .group_by(date_trunc)\
        .all()
    
    # Fill in missing days
    chart_data = []
    current_date = start_date
    daily_dict = {d[0]: d[1] for d in clicks_daily}
    
    for i in range(days + 1):
        day_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        chart_data.append({"date": day_str, "clicks": daily_dict.get(day_str, 0)})

    # 2. Top Referrers
    top_referrers = db.query(models.ClickEvent.referrer, func.count(models.ClickEvent.id))\
        .group_by(models.ClickEvent.referrer)\
        .order_by(func.count(models.ClickEvent.id).desc())\
        .limit(5).all()
        
    # 3. Top Devices (User Agent simplified)
    # In real app, use ua-parser. Here, simple grouping by raw string or rough match
    # Grouping by full UA is messy. Let's just return raw top UAs for now or simplify in frontend?
    # Or simplified logic:
    top_devices = db.query(models.ClickEvent.user_agent, func.count(models.ClickEvent.id))\
        .group_by(models.ClickEvent.user_agent)\
        .order_by(func.count(models.ClickEvent.id).desc())\
        .limit(5).all()
    
    # 4. Top Countries
    top_countries = db.query(models.ClickEvent.country, func.count(models.ClickEvent.id))\
        .group_by(models.ClickEvent.country)\
        .order_by(func.count(models.ClickEvent.id).desc())\
        .limit(5).all()
        
    # 5. Top Links (Re-use logic)
    top_urls = db.query(models.URL).order_by(desc(models.URL.clicks)).limit(5).all()

    return {
        "chart_data": chart_data,
        "top_referrers": [{"name": r[0] or "Direct", "value": r[1]} for r in top_referrers],
        "top_devices": [{"name": d[0] or "Unknown", "value": d[1]} for d in top_devices],
        "top_countries": [{"name": c[0] or "Unknown", "value": c[1]} for c in top_countries],
        "top_urls": top_urls
    }

@app.get("/admin/urls")
def get_all_urls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    urls = db.query(models.URL).order_by(desc(models.URL.created_at)).offset(skip).limit(limit).all()
    return urls

@app.delete("/admin/urls/{short_code}")
def delete_short_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Delete associated events first
    db.query(models.ClickEvent).filter(models.ClickEvent.url_id == db_url.id).delete()
    db.delete(db_url)
    db.commit()
    return {"message": "Deleted successfully"}

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_clicks = db.query(func.sum(models.URL.clicks)).scalar() or 0
    total_urls = db.query(models.URL).count()
    
    # Top URLs
    top_urls = db.query(models.URL).order_by(desc(models.URL.clicks)).limit(5).all()
    
    # Recent Clicks (Analytics)
    recent_clicks = db.query(models.ClickEvent).order_by(desc(models.ClickEvent.timestamp)).limit(10).all()
    
    return {
        "total_clicks": total_clicks,
        "total_urls": total_urls,
        "top_urls": top_urls,
        "recent_activity": recent_clicks
    }

@app.get("/{short_code}")
def redirect_to_url(
    short_code: str, 
    request: Request,
    db: Session = Depends(get_db),
    user_agent: Optional[str] = Header(None)
):
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    # Check Active
    if not db_url.is_active:
        raise HTTPException(status_code=410, detail="This link is inactive")

    # Check Expiry Time
    if db_url.expires_at and db_url.expires_at < datetime.utcnow():
        db_url.is_active = False
        db.commit()
        raise HTTPException(status_code=410, detail="This link has expired")

    # Check Max Clicks
    if db_url.max_clicks and db_url.clicks >= db_url.max_clicks:
        db_url.is_active = False
        db.commit()
        raise HTTPException(status_code=410, detail="This link has reached its click limit")

    # Check Password
    if db_url.password:
        # Redirect to frontend verify page
        # Assuming frontend is on same host port 1603 (or relative)
        # We need to inform frontend to show verify page.
        # Since this is a direct browser GET request, we redirect the browser.
        # Frontend URL: /verify/{short_code}
        # The Host header might be helpful, or use hardcoded relative if on same domain.
        # Since we use Nginx proxy, Host is passed.
        # If Host is "localhost:1603", redirecting to "/verify/..." works.
        return RedirectResponse(url=f"/verify/{short_code}")

    # Log Click
    db_url.clicks += 1
    
    # Create Event
    click_event = models.ClickEvent(
        url_id=db_url.id,
        referrer=request.headers.get("referer"),
        user_agent=user_agent,
        country="Unknown" # Placeholder
    )
    db.add(click_event)
    
    db.commit()
    
    return RedirectResponse(url=db_url.original_url)

@app.get("/")
def read_root():
    return {"message": "URL Shortener API is running"}
