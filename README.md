# Snapimmi Hybrid Workflow Guide

This project is configured for a dual-mode workflow: **Local Development** on Windows and **Server Deployment** via Docker.

## 1. Local Development (Fast Preview)

Use this mode when you are actively coding and want immediate feedback. This runs the app directly on your Windows Host.

### Prerequisites
- Node.js & pnpm installed on Windows.
- **PostgreSQL installed on Windows**. 
  - Ensure it is running on port `5432`.
  - Create a database (e.g., `visa_saas`).

### Setup
1.  Navigate to the code directory: `. cd code`
2.  Create/Update `.env`:
    ```ini
    DATABASE_URL="postgresql://postgres:password@localhost:5432/visa_saas"
    ```
    *Note: `localhost` here refers to your Windows machine.*

### Running
```powershell
cd code
pnpm dev
```
Access the app at `http://localhost:3000`.

---

## 2. Server Mode (Docker Production)

Use this mode to simulate the production server or when deploying to your PC-as-server.

### Architecture
- **App**: Builds a production Docker image (no hot-reloading).
- **Database**: Uses a **Dockerized Postgres** container (separate data from Windows Postgres).
- **Access**: Exposed via Cloudflare Tunnel at `https://si.snapdecode.in`.

### Running
From the project root (`snapimmi`):
```powershell
docker-compose up -d --build
```

### Important Notes
- **Data Sync**: The data in your Windows Postgres (Local Mode) is **NOT** synced with the Docker Postgres (Server Mode). They are completely separate.
- **Preview**: Changes made in `code/` are **NOT** reflected in Server Mode until you rebuild (`docker-compose up -d --build`). Use Local Mode for previews.
