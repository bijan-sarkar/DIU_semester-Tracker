# DIU CSE Semester & Exam Tracker

<div align="center">

[![CI Pipeline](https://github.com/bijan-sarkar/DIU_semester-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/bijan-sarkar/DIU_semester-Tracker/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

</div>

A Progressive Web Application (PWA) tailored specifically for **Daffodil International University (DIU)** Computer Science & Engineering (CSE) students. It breaks down each semester's courses into granular topics categorized by Midterm vs. Final exam syllabus, predicts exam appearance probability based on DIU Question Bank (DIUQBank) patterns, provides interactive topic tracking with real-time probability-weighted readiness metrics, and bridges university academics with global computer science curricula (MIT 6.006, Stanford CS106B) and industry standards (LeetCode, NeetCode 150).

---

## ✨ Features

- **12-Semester DIU CSE Framework**: Covers Level 1 Term 1 through Level 4 Term 3 with authentic course codes and credit allocations.
- **DIUQBank Analysis Engine**: Every core topic is tagged with an empirical appearance probability score (up to 95%) and historical question pattern notes.
- **Probability-Weighted Readiness Metrics**: Midterm Readiness % and Final Exam Readiness % dynamically calculate based on the importance and recurrence of topics mastered.
- **Global CS & Industry Benchmarks**: Links topics to MIT 6.006, Stanford CS106A/B, Harvard CS50x, and NeetCode 150 roadmaps.
- **Interactive Revision Notes**: Write and persist personalized revision notes, formulas, and past paper nuances per topic.
- **1-Click "Explore as Demo Student"**: Instant frictionless preview with a pre-configured Level 2 Term 1 student profile enrolled in Data Structures and OOP.
- **DIU Exam Countdown**: Real-time countdown timer to upcoming DIU Midterm and Final exam sprints.
- **Modern Glassmorphic UI**: DIU Emerald (`#10b981`) & Tech Cyan accents, dark/light theme toggle, custom scrollbars, and Plus Jakarta Sans typography.
- **PWA & Offline Ready**: Web App Manifest and Service Worker support for mobile home-screen installation and offline access.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+ (or `py.exe` on Windows)
- Node.js 18+ & npm

### Method 1: One-Command Runner (PowerShell)
```powershell
.\run-dev.ps1
```
This script automatically initializes the Python virtual environment, installs dependencies, seeds the database if not present, and concurrently starts both FastAPI and Vite.

### Method 2: Manual Startup

#### 1. Backend (FastAPI)
```powershell
# Create & activate venv
py -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements & seed
pip install -r backend\requirements.txt
python backend\seed_data.py

# Run API server
cd backend
uvicorn app.main:app --reload --port 8000
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Frontend (Vite + React)
```powershell
cd frontend
npm install
npm run dev
```
Open in browser: [http://localhost:5173](http://localhost:5173)

### Method 3: Docker Compose (FastAPI + PostgreSQL)
```bash
docker compose up --build
```
This launches:
- **FastAPI Backend**: `http://localhost:8000`
- **PostgreSQL 16**: `localhost:5432`
- **Vite React Frontend**: `http://localhost:5173`

---

## 🧪 Testing

Run all backend and integration tests directly from workspace root:
```powershell
.\.venv\Scripts\python.exe -m pytest
```
Or with npm script:
```powershell
npm.cmd run test:backend
```

Build production frontend:
```powershell
npm.cmd run build:frontend
```

---

## ☁️ Cloud Deployment (Render Blueprint)

This project includes a turnkey [`render.yaml`](render.yaml) configuration for 1-click deployment on **Render**:
1. Push repository to GitHub.
2. In Render dashboard, select **Blueprints** -> **New Blueprint Instance**.
3. Connect your repository. Render automatically provisions:
   - Managed PostgreSQL database (`diu-tracker-db`)
   - FastAPI web service (`diu-tracker-backend`) with automatic database migrations and seed script
   - React static site (`diu-tracker-frontend`) with URL rewrites

---

## 🔑 Demo Student Credentials
- **Email**: `demo.student@diu.edu.bd`
- **Password**: `diu123456`
- **1-Click**: Just click **"1-Click Explore as Demo Student"** on the login modal.
