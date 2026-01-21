# Shawty Link - Shorten your long 4ss URL.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

<img width="1582" height="966" alt="image" src="https://github.com/user-attachments/assets/7a93f91e-1f88-45c7-8566-36a5772a0f71" />

A simple, private, and powerful URL shortener with a premium, Apple-inspired user interface. Built with modern web technologies and containerized for easy deployment.

## ✨ Features

- **🚀 Good Performance**: Powered by Vite and FastAPI for lightning-fast responses.
- **📱 Fully Responsive**: A seamless experience across desktop, tablet, and mobile devices.
- **🎨 Modern UI/UX**: clean, glassmorphism-based design with smooth animations and transitions.
- **🌗 Dark/Light Mode**: automatically respects system preferences with a manual override option.
- **📊 Real-time Analytics**:
  - Live click tracking (polling updates every 3s).
  - Detailed charts for clicks over time (7d, 14d, 30d).
  - Geographic, device, and referrer breakdowns.
- **🛡️ Admin Dashboard**:
  - Secure management of all shortened links.
  - Delete unwanted links with confirmation.
  - View "Active Links" and "Top Performing" stats at a glance.
- **🐳 Dockerized**: One-command deployment using Docker Compose.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism)
- **Charts**: Recharts
- **HTTP Client**: Native Fetch API

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Server**: Uvicorn
- **Database**: SQLite (via SQLAlchemy)
- **Validation**: Pydantic

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Alpine Linux)

## 🚀 Getting Started

### Prerequisites
- Docker
- Docker Compose

### Installation & Running

1. **Clone the repository** (if applicable)
   ```bash
   git clone https://github.com/awpetrik/ShawtyLink.git
   cd ShawtyLink
   ```

2. **Start the application**
   Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
   This will build the frontend and backend images and start the services.

3. **Access the Application**
   - **Main App**: [http://localhost:1603](http://localhost:1603)
   - **Admin Dashboard**: [http://localhost:1603/admin](http://localhost:1603/admin)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application & endpoints
│   ├── Dockerfile
│   ├── requirements.txt
│   └── sql_app.db         # SQLite database (generated)
├── frontend/
│   ├── src/
│   │   ├── views/         # Page components (Home, Admin, Verify)
│   │   ├── App.jsx        # Main Layout & Routing
│   │   ├── index.css      # Global Styles
│   ├── Dockerfile
│   ├── nginx.conf         # Nginx configuration
│   └── package.json
└── docker-compose.yml     # Orchestration
```

## 📝 Usage

### Shortening a URL
1. Enter your long URL in the input box on the home page.
2. (Optional) Enter a custom alias.
3. Click the arrow button or press Enter.
4. Copy your new short link!

### Admin Dashboard
Navigate to `/admin` to view statistics.
- **Overview**: See total active links and total clicks.
- **Detailed Stats**: Click on the "Total Clicks" card to view detailed analytics graphs.
- **Manage Links**: Click on "Active Links" to view a full list and delete specific URLs.

## 📄 License

© Certified Lunatics. A Part Of Rivaldi's Network.
