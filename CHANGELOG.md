# Changelog

All notable changes to this project will be documented in this file.

## [v2.1.0] - 2026-01-26

### 🎉 New Features
- **Password Protection**: Links can now be protected with passwords for enhanced security.
- **Unlock Page**: Beautiful password entry interface with show/hide toggle functionality.
- **Link Expiration**: Set expiration dates for temporary links (auto-enforcement on redirect).
- **Click Limits**: Define maximum clicks before link deactivation (auto-enforcement).
- **Admin Panel - User Creation**: Admin can create new users directly from the dashboard.
- **Admin Panel - Edit Users**: Update user roles, status, email, and name.
- **Admin Panel - Delete Users**: Remove users with proper cascade deletion of their links.
- **CSV Export**: Download user reports as CSV from admin dashboard.
- **Account Self-Delete**: Users can delete their own accounts with password verification.

### 🎨 UI/UX Improvements
- **Rebranding**: Changed brand name from "Shawty Link" to "ShawtyLink" (no space) for consistency.
- **Dashboard Dynamic Greeting**: Time-based greetings (Morning/Afternoon/Evening).
- **Enhanced Password Fields**: Improved visibility and contrast in dark/light modes.
- **Password Toggle**: Native browser password reveal button hidden to avoid duplication.
- **Better Modals**: Improved Add User and Edit User modal designs.
- **Empty State**: Clean "No Users" state with helpful messaging.

### 🐛 Bug Fixes
- **Duplicate Delete Call**: Fixed admin delete user endpoint calling `db.delete()` twice.
- **Missing Cascade Delete**: Added cascade delete to User→URLs relationship to prevent orphaned data.
- **Missing Expiration Validation**: Added enforcement for `expires_at` field in redirect logic.
- **Missing Click Limit Validation**: Added enforcement for `max_clicks` field in both redirect and unlock endpoints.
- **Password Redirect Issue**: Fixed nginx routing for `/unlock` path to properly serve frontend.
- **Missing Environment Variable**: Added `FRONTEND_URL` to `.env.example` for password-protected redirects.
- **UX Conflicts**: Removed conflicting keyboard shortcut hints from dashboard.

### 🔧 Technical Improvements
- **Better Error Handling**: Improved validation in unlock and redirect endpoints.
- **Schema Organization**: Moved `UnlockRequest` schema to proper `schemas.py` file.
- **Code Quality**: Cleaned up duplicate code and improved file organization.

## [v2.0.1] - 2026-01-26

### 🐛 Fixes & Improvements
- **Guest Access**: Enabled URL shortening for unauthenticated users (Guests).
- **Rate Limiting**: Implemented **Redis-based Rate Limiter** limiting guests to 5 links per 30 days per IP to prevent abuse.
- **UI Interactivity**: Fixed issue where the Particle background blocked clicks on buttons (`pointer-events-none`).
- **Copy Feedback**: Enhanced "Copy Link" button with clear green visual feedback and bounce animation.
- **Upsell**: Added contextual "Create free account" helper text for custom alias upsell.
- **Polishing**: Removed distracting glowing background effect from the input box.
- **Backend**: Removed duplicate/broken endpoints in `main.py`.


### 🚀 Major Features
- **SaaS Transformation**: Complete pivot from a simple URL shortener to a user-based SaaS platform.
- **User Authentication**: Implemented secure JWT-based Login and Registration flows.
- **Persistent Database**: Migrated storage from in-memory/JSON to **PostgreSQL**.
- **High-Performance Caching**: Integrated **Redis** for caching redirects, significantly improving lookup speeds.
- **Interactive Particle Background**: Added a stunning WebGL-based cosmic particle background using OGL, featuring mouse parallax effects.

### 🎨 Frontend & UI/UX
- **Apple-Style Design System**: Completely redesigned UI with a clean, modern aesthetic, blur effects, and refined typography.
- **Dashboard**: New "My Links" dashboard allowing users to manage their shortened URLs.
- **QR Code Generation**: Added instant QR code generation for any link.
- **Edit & Delete**: Users can now edit destination URLs and delete active links.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.
- **Branding**: Updated footers with "Certified Lunatics" and "A Part of Rivaldi's Network" signature.

### 🛠 Backend
- **New API Structure**: Refactored FastAPi app with a scalable router-based architecture.
- **CRUD Endpoints**: Added protected endpoints for `GET /urls`, `PUT /urls`, and `DELETE /urls`.
- **User Management**: Added `User` and `URL` models with SQLAlchemy.
- **Security**: Added password hashing (Bcrypt) and OAuth2 bearer token support.

### 🐛 Fixes & Improvements
- Fixed Docker build issues by upgrading to Node.js 20-alpine.
- Fixed CORS issues for frontend-backend communication.
- Optimized Nginx configuration for single-page application routing.
- Fixed dependency conflicts with `ogl` and `vite`.

---

## [v1.0.0] - 2024-01-01
- Initial Release: Simple URL Shortener.
