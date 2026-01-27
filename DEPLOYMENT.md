# ShawtyLink - VPS Deployment Guide

Complete guide untuk deploy ShawtyLink ke Google Cloud VPS dengan Nginx, SSL, dan Docker.

## Prerequisites

- ✅ VPS Google Cloud (Ubuntu/Debian)
- ✅ Domain yang sudah pointing ke IP VPS (via Cloudflare/DNS provider)
- ✅ SSH access ke VPS
- ✅ Port 80, 443, 22 terbuka di firewall

## Table of Contents

1. [Initial VPS Setup](#1-initial-vps-setup)
2. [Install Dependencies](#2-install-dependencies)
3. [Clone Repository](#3-clone-repository)
4. [Environment Configuration](#4-environment-configuration)
5. [Docker Configuration](#5-docker-configuration)
6. [Deploy Application](#6-deploy-application)
7. [Nginx Configuration](#7-nginx-configuration)
8. [SSL Certificate](#8-ssl-certificate)
9. [Verification](#9-verification)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Initial VPS Setup

### 1.1 Connect ke VPS
```bash
ssh username@your-vps-ip
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Setup Google Cloud Firewall

**Via Google Cloud Console:**
1. Buka: https://console.cloud.google.com/networking/firewalls
2. Create Firewall Rule:
   - Name: `allow-http-https`
   - Targets: All instances
   - Source IP: `0.0.0.0/0`
   - Protocols: `tcp:80,443`

**Via gcloud CLI:**
```bash
gcloud compute firewall-rules create allow-http-https \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0
```

---

## 2. Install Dependencies

### 2.1 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
```

### 2.2 Install Docker Compose
```bash
# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker compose version
```

### 2.3 Install Nginx & Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

## 3. Clone Repository

```bash
cd ~
git clone https://github.com/awpetrik/ShawtyLink.git
cd ShawtyLink
```

---

## 4. Environment Configuration

### 4.1 Create `.env` File

> ⚠️ **PENTING**: Jangan gunakan karakter khusus `@` di password! Gunakan underscore atau huruf/angka saja.

```bash
nano .env
```

Paste configuration berikut:

```bash
# Database
POSTGRES_USER=agora
POSTGRES_PASSWORD=YourSecurePassword123  # NO special chars like @
POSTGRES_DB=shawtylink

# Security
SECRET_KEY=your-very-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Redis
REDIS_URL=redis://redis:6379

# Admin User
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=YourAdminPassword123

# CORS - Update dengan domain production Anda
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:1603

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

### 4.2 Common Pitfall: Password dengan Karakter Khusus

❌ **JANGAN:**
```bash
POSTGRES_PASSWORD=Pass@word123  # @ akan error!
```

✅ **GUNAKAN:**
```bash
POSTGRES_PASSWORD=Password_123  # Underscore OK
POSTGRES_PASSWORD=Password123   # Huruf/angka saja OK
```

---

## 5. Docker Configuration

### 5.1 Update Dockerfile Frontend

File: `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# CRITICAL: Set API URL untuk production
ARG VITE_API_URL=https://your-domain.com/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

> 🔑 **Key Point**: `ARG` dan `ENV` harus **sebelum** `RUN npm run build`!

### 5.2 Verify docker-compose.yml

File: `docker-compose.yml`

Pastikan environment variables di-pass dengan benar:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:alpine
    restart: always

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=${ALGORITHM}
      - ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}
      - INITIAL_ADMIN_EMAIL=${INITIAL_ADMIN_EMAIL}
      - INITIAL_ADMIN_PASSWORD=${INITIAL_ADMIN_PASSWORD}
      - FRONTEND_URL=${FRONTEND_URL}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    depends_on:
      - db
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=https://your-domain.com/api
    ports:
      - "1603:80"
    restart: always

volumes:
  postgres_data:
```

---

## 6. Deploy Application

### 6.1 Start Services dengan Urutan yang Benar

> 💡 **Pro Tip**: Database harus ready dulu sebelum backend start!

```bash
# Stop jika ada yang running
docker compose down

# Start database & redis dulu
docker compose up -d db redis

# Tunggu 15 detik untuk database initialization
sleep 15

# Start backend
docker compose up -d backend

# Start frontend
docker compose up -d frontend

# Check status
docker compose ps
```

### 6.2 Verify Logs

```bash
# Check all logs
docker compose logs --tail 50

# Check backend specifically
docker compose logs backend --tail 30

# Follow logs real-time
docker compose logs -f backend
```

**Expected Output:**
```
backend-1  | INFO:     Application startup complete.
backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 6.3 Test Services Locally

```bash
# Test frontend
curl http://localhost:1603

# Test backend
curl http://localhost:8000/docs

# Should return HTML
```

---

## 7. Nginx Configuration

### 7.1 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

Paste configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React SPA)
    location / {
        proxy_pass http://localhost:1603;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## 8. SSL Certificate

### 8.1 DNS Configuration

**Di Cloudflare Dashboard:**

1. Buka DNS settings untuk domain Anda
2. Add A Record:
   - Type: `A`
   - Name: `@` (atau subdomain seperti `shawty`)
   - IPv4 address: `your-vps-ip`
   - Proxy status: `DNS only` (gray cloud) - **PENTING untuk SSL setup!**
   - TTL: `Auto`

3. Save dan tunggu DNS propagate (1-5 menit)

### 8.2 Verify DNS

```bash
# Check DNS resolution
nslookup your-domain.com
dig your-domain.com +short

# Should return your VPS IP
```

### 8.3 Install SSL with Certbot

```bash
# Run certbot
sudo certbot --nginx -d your-domain.com

# Follow prompts:
# 1. Email: your-email@example.com
# 2. Terms: A (Agree)
# 3. Share email: N (No)
```

Certbot akan otomatis update Nginx config dengan SSL!

### 8.4 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### 8.5 Enable Cloudflare Proxy (Optional)

Setelah SSL terinstall, Anda bisa enable proxy:
- Kembali ke Cloudflare DNS
- Klik cloud icon jadi orange (Proxied)
- Di SSL/TLS settings, set ke "Full (strict)"

---

## 9. Verification

### 9.1 Check All Services

```bash
# Docker containers
docker compose ps

# Nginx
sudo systemctl status nginx

# SSL certificate
sudo certbot certificates

# Open ports
sudo netstat -tulpn | grep -E ':(80|443|8000|1603)'
```

### 9.2 Test in Browser

1. **Frontend**: `https://your-domain.com`
   - Should load without SSL warnings
   - Should show ShawtyLink homepage

2. **Login**: 
   - Email: `admin@yourdomain.com` (from INITIAL_ADMIN_EMAIL)
   - Password: (from INITIAL_ADMIN_PASSWORD)

3. **Create Short Link**:
   - Test apakah bisa create link
   - Test apakah redirect works

4. **Browser Console (F12)**:
   - Tidak ada error CORS
   - API calls ke `https://your-domain.com/api`

### 9.3 Health Check Commands

```bash
# Test API endpoint
curl https://your-domain.com/api/

# Test frontend
curl -I https://your-domain.com

# Check logs
docker compose logs --tail 20
```

---

## 10. Troubleshooting

### 10.1 Backend Restart Loop

**Symptom:**
```
backend-1  | socket.gaierror: [Errno -2] Name or service not known
backend-1  | ERROR: Application startup failed. Exiting.
```

**Causes:**
1. Database belum ready saat backend start
2. Password dengan karakter khusus (@) di DATABASE_URL

**Solution:**
```bash
# Stop all
docker compose down

# Start dengan urutan benar
docker compose up -d db redis
sleep 15
docker compose up -d backend frontend

# Check password di .env tidak punya @
```

### 10.2 Frontend Masih Hit localhost:8000

**Symptom:**
Browser console: `Access to XMLHttpRequest at 'http://localhost:8000/...'`

**Cause:**
Environment variable `VITE_API_URL` tidak terpass saat build.

**Solution:**
```bash
# 1. Verify Dockerfile punya ARG/ENV
cat frontend/Dockerfile | grep -A 2 "ARG VITE"

# Should show:
# ARG VITE_API_URL=https://your-domain.com/api
# ENV VITE_API_URL=$VITE_API_URL

# 2. Rebuild frontend
docker compose down frontend
docker rmi shawtylink-frontend
docker compose build --no-cache frontend
docker compose up -d frontend

# 3. Hard refresh browser (Ctrl+Shift+R)
```

### 10.3 CORS Error

**Symptom:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
```bash
# Edit .env
nano .env

# Update ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:1603

# Restart backend
docker compose restart backend
```

### 10.4 SSL Certificate Error

**Symptom:**
Certbot error: "Could not connect to server"

**Cause:**
Cloudflare proxy (orange cloud) interfere dengan SSL verification.

**Solution:**
1. Di Cloudflare, set DNS ke "DNS only" (gray cloud)
2. Run certbot lagi
3. Setelah sukses, enable proxy lagi (orange cloud)

### 10.5 Port Already in Use

**Symptom:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:1603: bind: address already in use
```

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :1603

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### 10.6 Database Authentication Failed

**Symptom:**
```
asyncpg.exceptions.InvalidPasswordError: password authentication failed
```

**Cause:**
Password di .env berbeda dengan password di existing database volume.

**Solution:**
```bash
# Remove old database volume
docker compose down -v

# ⚠️ WARNING: This deletes all data!

# Start fresh
docker compose up -d
```

---

## Maintenance

### Backup Database

```bash
# Export database
docker compose exec db pg_dump -U agora shawtylink > backup_$(date +%Y%m%d).sql

# Import database
docker compose exec -T db psql -U agora shawtylink < backup_20260127.sql
```

### Update Application (Safe Method)
This method ensures your database and `.env` configuration remain intact.

```bash
cd ~/ShawtyLink

# 1. Fetch latest updates
git fetch --all --tags

# 2. Checkout specific version (Recommended)
git checkout v2.2.0

# 3. Rebuild and restart containers (Preserves Data)
# IMPORTANT: Do NOT use -v flag
docker compose up -d --build

# 4. Clean up old images (Optional)
docker image prune -f
```

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend -f

# Last 50 lines
docker compose logs --tail 50
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend

# Stop and start
docker compose down
docker compose up -d
```

---

## Security Best Practices

1. ✅ **Change default passwords** di .env
2. ✅ **Use strong SECRET_KEY** (32+ characters)
3. ✅ **Enable Cloudflare proxy** untuk DDoS protection
4. ✅ **Regular backups** database
5. ✅ **Keep Docker images updated**
6. ✅ **Monitor logs** untuk suspicious activity
7. ✅ **Use fail2ban** untuk SSH protection
8. ✅ **Disable password auth**, use SSH keys only

---

## Production Checklist

Before going live:

- [ ] `.env` dengan credentials production
- [ ] `VITE_API_URL` di Dockerfile pointing ke domain production
- [ ] Nginx config dengan domain yang benar
- [ ] SSL certificate terinstall dan valid
- [ ] DNS pointing ke VPS IP
- [ ] Google Cloud Firewall allow port 80, 443
- [ ] Demo credentials di-remove dari LoginView
- [ ] CORS allow domain production
- [ ] Database backup strategy di-setup
- [ ] Monitoring/logging di-setup (optional: Sentry, LogRocket)

---

## Support

Jika masih ada issue setelah follow guide ini:

1. Check logs: `docker compose logs --tail 100`
2. Verify .env file: `cat .env`
3. Check container status: `docker compose ps`
4. Test DNS: `dig your-domain.com +short`
5. Test ports: `sudo netstat -tulpn | grep -E ':(80|443|8000|1603)'`

**Common Issues Repository:**
- GitHub Issues: https://github.com/awpetrik/ShawtyLink/issues

---

**Last Updated:** 2026-01-27  
**Version:** v2.1.0
