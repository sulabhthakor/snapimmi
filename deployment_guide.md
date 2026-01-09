# Deployment Guide: Snapimmi (Visa SaaS)

This guide details how to deploy the **Snapimmi** application in **Hybrid Mode**, allowing you to develop locally without Docker while keeping a production-ready Docker environment for deployment.

**Latest Update**: The project now supports a **Hybrid Workflow**:
1.  **Local Dev**: Runs on host machine (Windows) using local PostgreSQL.
2.  **Server Prod**: Runs in Docker containers using isolated PostgreSQL.

---

## 1. Local Development (Hybrid Workflow)

Use this mode for active development (`coding`, `UI changes`). It uses your Windows tools directly for maximum speed and keeps Docker for production-checks only.

### 1.1 Prerequisites
-   **Node.js** (v18+) and **pnpm** installed on Windows.
-   **PostgreSQL** Service installed on Windows.
    -   Port: `5432` (Default)
    -   User: `postgres`
    -   Password: `root` (Updated to match your setup)
    -   Database: `visa_saas`

### 1.2 Setup
1.  **Start Database**:
    Ensure your local PostgreSQL service is running on Windows.

2.  **Install Dependencies**:
    *   **Where**: Open your terminal in the `snapimmi\code` directory.
        *   Example: `cd "c:\Docker Hosted\snapimmi\code"`
    *   **Command**:
        ```powershell
        pnpm install
        # or
        npm install
        ```
    *   **What it does**: Downloads and installs all the necessary project dependencies (libraries like React, Next.js, etc.) listed in `package.json` into the `node_modules` folder.

3.  **Environment Variables**:
    The `.env` file in `snapimmi\code` is pre-configured for your local setup:
    ```ini
    # Connects to localhost:5432 (Windows Postgres)
    DATABASE_URL="postgresql://postgres:root@localhost:5432/visa_saas?schema=public"
    ```

4.  **Initialize Database**:
    *   **Where**: Run closer to `package.json` inside `snapimmi\code`.
    *   **Command**:
        ```powershell
        npx prisma db push
        ```
    *   **What it does**: Connects to your local Postgres database (`visa_saas`), reads the `schema.prisma` file, and creates/updates the tables to match your code.
    *   **Optional Seed**:
        ```powershell
        npx prisma db seed
        ```
        *   **What it does**: Populates the database with initial dummy data (e.g., default admin user, categories) so you don't start with an empty app.

5.  **Run Application**:
    *   **Where**: Inside `snapimmi\code`.
    *   **Command**:
        ```powershell
        pnpm dev
        ```
    *   **What it does**: Starts the local development server. It compiles the project and makes it accessible at `http://localhost:3002`. It watches for file changes and updates the browser automatically.

---

## 2. Server Deployment (Docker)

Use this mode to host the application as a production server. This isolates the environment and exposes it via Cloudflare Tunnel.

### 2.1 Dependencies
-   Docker Desktop (Running)
-   Cloudflare Tunnel credentials (`config.yml` and `.json` file).

### 2.2 Configuration

#### Docker Ports (Shared Hosting Friendly)
To avoid conflicts with other projects (like `evolution-api` or `localmarket`), the following host ports are used:
-   **Postgres**: `5434` (Maps to internal 5432)
-   **Redis**: `6380` (Maps to internal 6379)
-   **MinIO**: `9002` (API), `9003` (Console)
-   **Mailpit**: `8026` (UI), `1026` (SMTP)

#### Cloudflare Tunnel
1.  Place your tunnel JSON credential file in `snapimmi/cloudflared/`.
2.  Update `snapimmi/cloudflared/config.yml`:
    ```yaml
    tunnel: YOUR_TUNNEL_ID
    credentials-file: /etc/cloudflared/YOUR_TUNNEL_ID.json

    ingress:
      - hostname: si.snapdecode.in
        # Points to the nginx service inside Docker
        service: http://nginx:80
      - service: http_status:404
    ```

### 2.3 Launching
*   **Where**: Open your terminal in the **root** `snapimmi` directory (where `docker-compose.yml` is located).
    *   Example: `cd "c:\Docker Hosted\snapimmi"`
*   **Command**:
    ```powershell
    docker-compose up -d --build
    ```
*   **What it does**:
    1.  **Builds**: Creates the Docker images for your specialized services (like the Next.js app) based on the `Dockerfile`.
    2.  **Starts**: Launches all containers defined in `docker-compose.yml` (Postgres, Redis, App, Nginx, Tunnel, etc.).
    3.  **Detaches** (`-d`): Runs the containers in the background so they keep running even if you close the terminal.
    4.  **Networking**: Connects all containers on a private network (`visa-network`) so they can communicate securely.

*Note: The `docker-compose.yml` automatically overrides the `DATABASE_URL` to point to the secure Dockerized database, ignoring your local `.env` settings.*

### 2.4 Architecture
-   **Nginx**: Reverse proxy listening on internal port 80.
-   **Next.js**: Production build.
-   **Postgres**: Dockerized database (Isolated from your local Windows DB).
-   **Tunnel**: Outbound connection to Cloudflare.

---

## 3. Workflow Summary

| Task | Environment | Command | Database Used |
| :--- | :--- | :--- | :--- |
| **Coding / Debugging** | Local (Windows) | `pnpm dev` | Local Windows Postgres (`localhost:5432`) |
| **Production Test** | Docker | `docker-compose up` | Docker Postgres (`postgres:5432`) |
| **Data Reset** | Local | `npx prisma migrate reset` | Local Windows Postgres |
| **Data Reset** | Docker | `docker-compose down -v` | Docker Postgres |

> [!IMPORTANT]
> **Data Separation**: Your Local DB and Docker DB are completely separate. Creating a user in `pnpm dev` will NOT show up in the Docker version, and vice-versa.
