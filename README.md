# ShawtyLink - The Modern SaaS URL Shortener

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<img width="1280" height="771" alt="image" src="https://github.com/user-attachments/assets/c048f28b-4729-4c60-8271-0eb266dc7369" />

A powerful, self-hostable SaaS URL shortener with a premium Apple-inspired design. Built for speed, privacy, and scalability.

## ✨ Features (v2.1.0)

### Core Features
- **User System**: Full SaaS architecture with Login, Register, and JWT Authentication.
- **Robust Storage**: Production-grade **PostgreSQL** with async SQLAlchemy.
- **High-Speed Caching**: **Redis** integration for zero-latency redirects.
- **Premium UI/UX**:
  - Cosmic Particle Background (WebGL/OGL) with parallax effect.
  - Glassmorphism architecture with dark/light mode support.
  - Fully responsive design for all devices.
  - **New**: Mobile Card View for better usability on small screens.
  - **New**: Global Toast Notifications for instant feedback.

### User Dashboard
- **Link Management**: Full CRUD operations for your links.
- **QR Code Generation**: Instant QR codes for any shortened link.
- **Real-time Analytics**: Click tracking and statistics.
- **Account Security**: Self-service account deletion with password verification.

### Admin Panel

<p align="center">
  <img width="1280" height="757" alt="image" src="https://github.com/user-attachments/assets/e6ed0685-8218-4287-8bb9-a3c3e2cc32cf" />
</p>

- **User Management**: Create, edit, and delete users.
- **Role Management**: Assign admin/superuser roles.
- **Global Analytics**: Site-wide statistics dashboard.
- **CSV Reports**: Export user data and analytics.

---

### Advanced Link Features (NEW in v2.2.0) 🎉

<p align="center">
  <img width="1280" height="934" alt="image" src="https://github.com/user-attachments/assets/e418c4d5-dbfa-47fb-9120-f38d2108c163" />
</p>

- **Password Protection**: Secure your links with password authentication.
- **Unlock Page**: Beautiful password entry page with show/hide toggle.
- **Link Expiration**: Set expiration dates for temporary links.
- **Click Limits**: Define maximum clicks before link deactivation.
- **Custom Aliases**: Choose your own short codes.

---

## 📝 Planned Features (Next)
- **Analytics Dashboard**: Detailed click analytics with graphs and geo-location data.
- **Custom Domains**: Support for your own branded short domains.
- **QR Code Customization**: Add logos and customize QR code design.
- **Link Tags & Folders**: Organize links with categories and folders.
- **API Keys**: Generate API keys for programmatic link creation.
- **Webhooks**: Real-time notifications for link events.
- **Team Workspaces**: Collaborate with team members on shared links.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Visuals**: OGL (WebGL Particles)
- **State**: Context API

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL (Async SQLAlchemy)
- **Cache**: Redis
- **Auth**: OAuth2 with Password + Bearer JWT

### Infrastructure
- **Containers**: Docker & Docker Compose
- **Server**: Nginx (Alpine Linux)

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/awpetrik/ShawtyLink.git
   cd ShawtyLink
   ```

2. **Configure Environment**
   You **MUST** create a `.env` file to run the application. We have provided an example file.
   ```bash
   cp .env.example .env
   ```
   
   Open `.env` and fill in your secure credentials:
   ```env
   # Database
   POSTGRES_USER=shawty
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=shawtylink

   # Security
   SECRET_KEY=generate_a_very_long_random_secret_string
   ALGORITHM=HS256
   
   # Admin (Optional - for future use)
   INITIAL_ADMIN_EMAIL=admin@shawty.link
   INITIAL_ADMIN_PASSWORD=admin123
   ```

3. **Run with Docker**
   Spin up the entire stack (Frontend, Backend, Postgres, Redis, Nginx):
   ```bash
   docker-compose up -d --build
   ```

4. **Access the Application**
   - **Frontend**: [http://localhost:1603](http://localhost:1603)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routers/       # API Routes (Auth, URLs, Users)
│   │   ├── models.py      # Database Tables
│   │   ├── schemas.py     # Pydantic Models
│   │   └── database.py    # DB Connection
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Particles, Modals)
│   │   ├── pages/         # Dashboard, Links, Settings
│   │   └── views/         # Public Pages (Home, Login)
│   └── Dockerfile
├── docker-compose.yml     # Service Orchestration
└── .env                   # Environment Secrets (GitIgnored)
```

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

---

**Certified Lunatics** — A Part of Rivaldi's Network
