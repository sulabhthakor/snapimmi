# Deployment Guide: Snapimmi (Visa SaaS)

**For Freshers & Developers**

This guide explains exactly how to run the **Snapimmi** project in two different modes:
1.  **Local Development (Laptop)**: For coding, testing, and making changes.
2.  **Production Hosting (Server/PC)**: For running the live application using Docker.

---

## 1. Local Development (Laptop)

**Goal**: Run the app on your Windows laptop, using your local PostgreSQL database.

### Prerequisites (Install these first)
1.  **Node.js (v20 or v22)**: Download from [nodejs.org](https://nodejs.org/).
2.  **Git**: Download from [git-scm.com](https://git-scm.com/).
3.  **PostgreSQL**: Download and install PostgreSQL for Windows.
    *   **Important**: During installation, set the password to `root` (or remember what you set).
    *   Default port is `5432`.
4.  **pnpm**: Open PowerShell and run:
    ```powershell
    npm install -g pnpm
    ```

### Step-by-Step Setup

#### 1. Get the Code
*   **Where**: Open **PowerShell** or **VS Code Terminal**.
*   **Command**:
    ```powershell
    # Go to your projects folder
    cd C:\Projects
    
    # Clone the repository
    git clone https://github.com/sulabhthakor/snapimmi.git
    
    # Go into the code folder (IMPORTANT: All dev work happens here)
    cd snapimmi\code
    ```

#### 2. Install Dependencies
*   **Where**: Inside `snapimmi\code`.
*   **Command**:
    ```powershell
    pnpm install
    ```
*   **What it does**: Downloads all the libraries required for the project.

#### 3. Configure Database Connection (.env)
*   **Where**: Inside `snapimmi\code`.
*   **Action**: The `.env` file should already be configured for local development. Verify it contains:
    ```ini
    # Local Development Configuration
    DATABASE_URL="postgresql://postgres:root@localhost:5432/visa_saas?schema=public"
    AUTH_SECRET="dev-secret-key-change-in-production"
    AUTH_TRUST_HOST=true
    ```
*   **Note**: Update the password (`root`) if your Windows PostgreSQL uses a different password.

#### 4. Setup the Database
*   **Where**: Inside `snapimmi\code`.
*   **Command 1 (Create DB & Tables)**:
    ```powershell
    pnpm exec prisma db push
    ```
    *   *What it does*: Creates the `visa_saas` database in your local Postgres and creates all the tables (User, Firm, etc.).
    
*   **Command 2 (Generate Client)**:
    ```powershell
    pnpm exec prisma generate
    ```
    *   *What it does*: Creates the type-safe database client for the code to use.

*   **Command 3 (Seed Data - Optional)**:
    ```powershell
    pnpm exec prisma db seed
    ```
    *   *What it does*: Fills the database with dummy users (Admin, Agent) so you can log in immediately.

#### 5. Run the App
*   **Where**: Inside `snapimmi\code`.
*   **Command**:
    ```powershell
    pnpm dev
    ```
*   **Result**: The app will start. Open your browser and go to `http://localhost:3002`.

---

## 2. Production Hosting (Server/PC)

**Goal**: Host the application permanently on a server using Docker. This isolates the app so it doesn't mess with your server's settings.

### Prerequisites
1.  **Docker Desktop**: Install and ensure it is running (Green whale icon).
2.  **Git**: Installed.

### Step-by-Step Deployment

#### 1. Fetch Latest Code
*   **Where**: Open PowerShell on your Server PC.
*   **Command**:
    ```powershell
    cd C:\Projects\snapimmi
    git pull
    ```

#### 2. Configure Cloudflare Tunnel (One Time)
*   **Where**: Inside `snapimmi\cloudflared` folder.
*   **Action**:
    1.  Place your `credentials.json` file here.
    2.  Create/Edit `config.yml`:
        ```yaml
        tunnel: YOUR-TUNNEL-ID-HERE
        credentials-file: /etc/cloudflared/YOUR-TUNNEL-ID-HERE.json
        ingress:
          - hostname: si.snapdecode.in
            service: http://nginx:80
          - service: http_status:404
        ```

#### 3. Start the Server
*   **Where**: Into the **root project folder** (`snapimmi`), NOT `code`.
*   **Command**:
    ```powershell
    docker-compose up -d --build
    ```
*   **What it does**:
    *   Builds the application container.
    *   Starts Postgres (Port 5434), Redis (Port 6381), MinIO (Port 9002), and Nginx (Port 8081).
    *   Connects the Cloudflare tunnel.

#### 4. Access the App
*   **Remote**: `https://si.snapdecode.in`
*   **Local**: `http://localhost:3002` (Direct App) or `http://localhost:8081` (Nginx Proxy).

---

## Troubleshooting / Common Issues

### 1. "Failed to load external module @prisma/client"
*   **Cause**: The database client wasn't generated correctly or environment/version mismatch.
*   **Fix**:
    ```powershell
    cd code
    pnpm exec prisma generate
    ```

### 2. "Invalid character" during Prisma Generate
*   **Cause**: Your `.env` file might have hidden characters if created via PowerShell `echo`.
*   **Fix**: Open `.env` in VS Code or Notepad, ensure it looks clean, save it with UTF-8 encoding.

### 3. Port Conflicts (EADDRINUSE)
*   **Cause**: The app is already running.
*   **Fix**:
    1.  Find what's running on port 3002:
        ```powershell
        netstat -ano | findstr :3002
        ```
    2.  Kill the process (Replace PID with the number from above):
        ```powershell
        taskkill /PID <PID> /F
        ```

### 4. Database Connection Error
*   **Cause**: Postgres service is not running OR credentials in `.env` are wrong.
*   **Fix**: Check `services.msc` to see if `postgresql-x64` is running. Check your password in `.env`.
