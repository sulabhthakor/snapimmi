# Shared Hosting Guide: Managing Multiple Apps

**For Server Administrators**

This guide explains how to host multiple applications (like `localmarketpwa` and `snapimmi`) on the **same server** (your Windows PC using Docker) without them crashing or conflicting with each other.

---

## 1. The Golden Rule: Unique Ports

Every application needs specific "Ports" to talk to the world. If two apps try to use the same port, one will fail.
We assign **Unique Ports** to every project.

### Assigned Port Registry

| Project Name | Feature | Internal Port | **External Host Port** (Assigned) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **LocalMarketPWA** | Web App (Next.js) | 3000 | **3000** | Default |
| | Database (Postgres) | 5432 | **5432** | Default |
| | Nginx (Proxy) | 80 | **80** | Accessible via `localhost` |
| | Cloudflare | - | - | Tunnel ID: `localmarket` |
| | | | | |
| **SnapImmi** | Web App (Next.js) | 3000 | **3002** | Changed to avoid conflict |
| | Database (Postgres) | 5432 | **5434** | Changed to avoid conflict |
| | Redis | 6379 | **6381** | |
| | MinIO API | 9000 | **9002** | |
| | MinIO Console | 9001 | **9003** | |
| | Mailpit UI | 8025 | **8026** | |
| | Nginx (Proxy) | 80 | **8081** | Accessible via `localhost:8081` |
| | Cloudflare | - | - | Tunnel ID: `visa_saas` |

---

## 2. Managing Docker Containers

You can run both projects simultaneously. Docker handles the isolation.

### Starting Projects
*   To start **LocalMarketPWA**:
    ```powershell
    cd C:\Projects\localmarketpwa
    docker-compose up -d
    ```
*   To start **SnapImmi**:
    ```powershell
    cd C:\Projects\snapimmi
    docker-compose up -d
    ```

### Checking Status
Run this command to see ALL running containers across all projects:
```powershell
docker ps
```
You should see a list of containers. Check the **PORTS** column to verify they match the registry above.

### Stopping Projects
*   To stop **LocalMarketPWA**:
    ```powershell
    cd C:\Projects\localmarketpwa
    docker-compose stop
    ```
    *(Use `down` instead of `stop` if you want to remove the containers completely)*

---

## 3. Cloudflare Tunnels (Remote Access)

Each project has its own Tunnel container. This allows you to access them from the internet via Subdomains.

*   **LocalMarketPWA**: `https://lm.snapdecode.in` -> Points to `localmarket` container.
*   **SnapImmi**: `https://si.snapdecode.in` -> Points to `visa_saas` container.

**Important**:
Ensure your `config.yml` in each project's `cloudflared` folder points to the correct internal service:
*   LocalMarket: `service: http://localmarket-nginx:80`
*   SnapImmi: `service: http://nginx:80` (Internal Docker network name for that project's nginx).

---

## 4. Maintenance & Backups

### Database Backups (Postgres)
Since each project has its own Postgres container, you back them up separately.

**Command to Backup SnapImmi DB**:
```powershell
docker exec -t visa_saas_db pg_dumpall -c -U postgres > snapimmi_backup.sql
```

**Command to Backup LocalMarket DB**:
```powershell
docker exec -t localmarketpwa-postgres-1 pg_dumpall -c -U postgres > localmarket_backup.sql
```

---

## 5. Adding a New Project?
If you add a 3rd project (e.g. `NewApp`), follow these rules:
1.  **App Port**: Assign `3003`.
2.  **DB Port**: Assign `5435`.
3.  **Nginx Port**: Assign `8082`.
4.  **Update this file**: Add the new ports to the Registry table above so you don't forget!
