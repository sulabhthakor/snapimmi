# Shared Hosting Guide: Snapimmi Integration

This document outlines how `snapimmi` co-exists with other projects (like `evolution-api`, `localmarketpwa`, `n8n`) on the same host machine.

## 1. Directory Structure
All projects are organized as sibling directories under `C:\Docker Hosted\`:

```
C:\Docker Hosted\
├── snapimmi/              # Visa SaaS
├── localmarketpwa/        # E-commerce PWA
├── evolution-api/         # WhatsApp API
└── n8n/                   # Workflow Automation
```

## 2. Port Allocation Strategy

To avoid "Port Already in Use" errors when running multiple projects simultaneously, `snapimmi` uses the following unique host ports:

| Service | Container Port | **Host Port (Snapimmi)** | Standard/Other Projects |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | 5432 | **5434** | 5432 (Local), 5433 (Ev. API?) |
| **Redis** | 6379 | **6380** | 6379 (Standard) |
| **MinIO API** | 9000 | **9002** | 9000 |
| **MinIO Console**| 9001 | **9003** | 9001 |
| **Mailpit SMTP** | 1025 | **1026** | 1025 |
| **Mailpit UI** | 8025 | **8026** | 8025 |
| **Next.js** | 3000 | **Not Exposed** | Exposed via Nginx/Tunnel |
| **Nginx** | 80 | **Not Exposed** | Exposed via Tunnel |

*Note: Services inside the Docker network (`visa-network`) still communicate using standard ports (e.g., App talks to Postgres on port 5432).*

## 3. Network Isolation

`snapimmi` uses its own dedicated bridge network:
```yaml
networks:
  visa-network:
    driver: bridge
```
This ensures complete isolation from other projects. Containers in `snapimmi` cannot directly talk to containers in `localmarketpwa` unless joined to a shared network (which is not currently configured).

## 4. Cloudflare Tunnel Management

Each project maintains its own dedicated `cloudflared` container and tunnel configuration.
-   **Hostname**: `si.snapdecode.in`
-   **Config Location**: `snapimmi/cloudflared/config.yml`
-   **Credential Location**: `snapimmi/cloudflared/[ID].json`

This descentralized approach means you can start/stop `snapimmi` independently without affecting the routing of other domains.

## 5. Operational Commands

Here are the specific commands to manage `snapimmi` without disturbing your other running projects.

### 5.1 Start / Update Project
*   **Where**: Open your terminal in the **root** `snapimmi` directory.
    *   Example: `cd "c:\Docker Hosted\snapimmi"`
*   **Command**:
    ```powershell
    docker-compose up -d --build
    ```
*   **What it does**:
    1.  Rebuilds the images if you changed any code.
    2.  Starts the `snapimmi` containers (App, Postgres, Redis, etc.) in the background.
    3.  **Crucially**, it does *not* touch `evolution-api` or `localmarketpwa` containers.

### 5.2 Stop Project
*   **Where**: Inside `snapimmi` root directory.
*   **Command**:
    ```powershell
    docker-compose down
    ```
*   **What it does**:
    1.  Stops and removes only the containers defined in `snapimmi/docker-compose.yml`.
    2.  Frees up the ports (5434, 6380, etc.).
    3.  Your other projects continue running uninterrupted.

### 5.3 View Logs
*   **Where**: Inside `snapimmi` root directory.
*   **Command**:
    ```powershell
    docker-compose logs -f
    ```
*   **What it does**:
    1.  Streams the live output from all `snapimmi` containers.
    2.  Useful for debugging startup errors or checking if the database is ready.
    3.  Press `Ctrl+C` to exit the log view (this will **not** stop the containers).
