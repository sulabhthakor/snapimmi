# Shared Hosting Guide: Snapimmi

This guide serves as a reference when hosting **Snapimmi** on a machine that already hosts other projects (like **LocalMarketPWA** or **n8n**).

## 1. Port Conflicts (The 80:80 Issue)

### The Problem
By default, the `snapimmi` **Nginx** container is configured to bind to port `80` on the host machine (`80:80`) in `docker-compose.yml`.
If you are already running **LocalMarketPWA**, it is likely already using port `80`.
Running both will cause a "Port already allocated" error.

### The Solution: Tunnel-Only Mode
Since we are using **Cloudflare Tunnel**, standard HTTP ports (80/443) do not strictly need to be exposed to the host machine. The Tunnel connects internally to the container.

#### Recommended Action
If you run into a port conflict, **comment out** the ports section in `snapimmi/docker-compose.yml`:

```yaml
  nginx:
    image: nginx:alpine
    # ...
    # ports:        <-- Comment this out
    #   - "80:80"   <-- Comment this out
    # ...
```

This ensures `snapimmi` runs entirely isolated inside Docker, accessible **only** via:
1.  The Cloudflare Tunnel (`https://si.snapdecode.in`).
2.  Other containers in the `visa-network`.

It will **not** be accessible via `http://localhost`.

## 2. Docker Networks

Snapimmi uses a dedicated network named `visa-network`.
- **Isolation**: It cannot communicate with `localmarket` or `n8n` containers by default.
- **Integration**: To connect them (e.g., if Snapimmi needs to talk to n8n), you must add them to a shared network (like `shared_web`) in both `docker-compose.yml` files.

## 3. Multiple Cloudflare Tunnels

The recommended setup is **One Tunnel Per Project**.
- **Snapimmi**: Uses its own tunnel token (defined in `snapimmi/cloudflared/`).
- **LocalMarket**: Uses its own tunnel token.

This ensures that if you restart Snapimmi, it does not disrupt LocalMarket's tunnel connection.
