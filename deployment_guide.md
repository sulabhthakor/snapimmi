# Deployment Guide: Snapimmi (Visa SaaS)

This guide details how to deploy the **Snapimmi** application in **Server Mode** using Docker and Cloudflare Tunnel, and how to set up the **Local Development** environment.

---

## 1. Local Development (Windows Native)

Use this mode for active development (`coding`, `UI changes`) to get immediate previews without rebuilding containers.

### 1.1 Prerequisites
- **Node.js** (v18+) and **pnpm** installed on Windows.
- **PostgreSQL** installed on Windows service.
    - Port: `5432`
    - Superuser: `postgres`
    - Password: (as set during installation)

### 1.2 Setup
1.  **Database Setup**:
    Ensure your local Windows Postgres has a database named `visa_saas`.
    ```powershell
    # Optional: Command to create db if you have psql installed
    createdb -U postgres visa_saas
    ```

2.  **Environment Variables**:
    Navigate to `code/` and create `.env` if it doesn't exist.
    ```ini
    # Connect to Windows Postgres (localhost)
    DATABASE_URL="postgresql://postgres:your_password@localhost:5432/visa_saas"
    ```

3.  **Run Application**:
    ```powershell
    cd code
    pnpm install
    pnpm dev
    ```
    Access at `http://localhost:3000`. Changes to files reflect immediately.

---

## 2. Server Deployment (Docker)

Use this mode to host the application as a production server. This isolates the environment and exposes it via Cloudflare Tunnel.

### 2.1 Dependencies
- Docker Desktop (Running)
- Cloudflare Tunnel credentials

### 2.2 Configuration

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
Run the following command from the `snapimmi` root directory:

```powershell
docker-compose up -d --build
```

### 2.4 Architecture
- **Nginx**: Reverse proxy listening on internal port 80.
- **Next.js**: Production build, listening on port 3000 (not exposed to host).
- **Postgres**: Dockerized database (files stored in `postgres_data` volume).
- **Tunnel**: Outbound connection to Cloudflare.

---

## 3. Data Management
> [!WARNING]
> **Data Separation**: The **Local** mode uses your Windows Postgres. The **Server** mode uses the Docker Postgres. Data created in one **does NOT** appear in the other.

- **To reset Server DB**: `docker-compose down -v` (Deletes volumes).
- **To reset Local DB**: manual SQL drop/create.
