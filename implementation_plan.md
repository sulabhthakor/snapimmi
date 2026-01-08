# Snapimmi Hybrid Workflow Implementation Plan

## Goal
Enable a hybrid development workflow for `snapimmi`:
1.  **Local Development**: Run `pnpm dev` locally on Windows, connecting to a local Windows Postgres instance. Immediate previews without Docker rebuilds.
2.  **Server/Production**: Run `docker-compose up` to launch a producation-ready stack (Next.js + Postgres + Redis + MinIO + Mailpit + Nginx + Cloudflare Tunnel).

## User Review Required
> [!IMPORTANT]
> **Database Data Separation**: 
> Your Local Development enviromment uses the Postgres installed on Windows. 
> The Docker environment uses a *separate* Postgres container (`visa_saas_db`). 
> **Data will not automatically sync between them.** You will have two separate databases.

## Proposed Changes

### Snapimmi Project (`c:\Docker Hosted\snapimmi`)

#### Nginx Configuration
We will introduce Nginx to proxy requests, matching the `localmarketpwa` `SHARED_HOSTING_GUIDE` pattern.

#### [NEW] [nginx.conf](file:///c:/Docker%20Hosted/snapimmi/nginx/nginx.conf)
- Standard reverse proxy configuration.
- Routes traffic to the `visa_saas_app` container.

#### Docker Compose Configuration
We will transform `docker-compose.yml` from a "dev-in-docker" setup to a "server/prod" setup.

#### [MODIFY] [docker-compose.yml](file:///c:/Docker%20Hosted/snapimmi/docker-compose.yml)
- **Next.js Service (`nextjs-app` / `visa_saas_app`)**:
    - Remove `target: deps` (Build full production image).
    - Remove bind mounts (code is baked into image).
    - Remove `command` override (use Dockerfile's `scan` or default CMD).
    - Set `DATABASE_URL` to point to the docker container `visa_saas_db`.
- **Nginx Service**:
    - Add `nginx` service mounting the new config.
- **Cloudflared Service**:
    - Point to `nginx` instead of the nextjs app directly.
    - Ensure `depends_on` Nginx.

## Verification Plan

### Manual Verification
1.  **Local Dev**: 
    - User runs `cd code` -> `pnpm dev`.
    - Verifies app connects to local Windows Postgres (User ensures `code/.env` points to `localhost`).
2.  **Server Mode**:
    - Run `docker-compose up -d --build`.
    - Verify all containers (App, DB, Redis, MinIO, Mailpit, Nginx, Tunnel) are running.
    - Verify app is accessible via the Cloudflare Tunnel domain (`si.snapdecode.in`).
