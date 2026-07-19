# Jitsi Meet (Docker) — Stable Deployment Guide

This document provides a concise, step-by-step guide to install and run a stable, production-ready instance of Jitsi Meet using the official Docker setup.

## Prerequisites

- Operating system: a modern Linux distribution (Ubuntu 20.04 / 22.04 recommended)
- Docker (check with `docker --version`)
- Docker Compose (check with `docker compose version`)
- A public IP and a DNS name (FQDN) for production deployments (e.g. `meet.example.com`)

## Quick start — clone repository

```bash
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
cp env.example .env
```

## Generate secure internal passwords

Run the included helper to create randomized passwords used by the services:

```bash
./gen-passwords.sh
```

If you previously started Jitsi and want to reset configuration, remove the config folder before rebuilding:

```bash
rm -rf ~/.jitsi-meet-cfg
```

## Configure `.env`

Open `.env` and update the values appropriate for your environment.

Production (domain + Let's Encrypt):

```ini
PUBLIC_URL=https://meet.example.com
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.example.com
LETSENCRYPT_EMAIL=admin@example.com
# For media routing (replace with your server public IP)
JVB_ADVERTISED_IPS=203.0.113.10
```

Local / Testing (no domain):

Option A — localhost only:

```ini
PUBLIC_URL=http://localhost:8000
DOCKER_HOST_ADDRESS=127.0.0.1
```

Option B — LAN IP (self-signed certs; browser warnings expected):

```ini
PUBLIC_URL=https://192.168.1.100:8443
JVB_ADVERTISED_IPS=192.168.1.100
```

Notes:
- If using a LAN IP or self-signed certs, open the WebSocket URL in your browser and accept the certificate before using Jitsi (`https://<IP>:8443/xmpp-websocket`).
- Make sure `JVB_ADVERTISED_IPS` is set to a reachable IP for media (important for ICE candidates).

## Firewall / Ports

Open these ports on your host/cloud firewall:

- TCP 80, 443 (or 8000, 8443 if configured)
- UDP 10000 (required for RTP media via the Jitsi Videobridge)
- UDP 20000 (only if using Jibri for recording/streaming)

Example UFW commands (Ubuntu/Debian):

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 10000/udp
sudo ufw reload
```

## Launching the stack

Start containers in detached mode:

```bash
docker compose up -d
```

Check container status:

```bash
docker compose ps
```

Expected services: `web`, `prosody`, `jicofo`, `jvb` (and optional `jibri` if enabled).

## Troubleshooting

- Stuck at "Connecting to conference..." or frequent disconnections
	- Cause: UDP 10000 blocked or `JVB_ADVERTISED_IPS` missing/incorrect
	- Fix: Ensure UDP 10000 is open and set `JVB_ADVERTISED_IPS` to the server's public IP.

- `WebSocket connection to wss://... failed`
	- Cause: Certificate issue or blocked WebSocket endpoint
	- Fix: For self-signed certs, visit `https://<YOUR_IP>:8443/xmpp-websocket` and accept the warning; for production, verify DNS/SSL config.

- `gum.not_found` / `NotFoundError: Requested device not found`
	- Cause: Browser can't access microphone/camera
	- Fix: Connect a microphone/camera, enable browser permissions, or join with audio/video muted via URL suffix: `#config.startWithAudioMuted=true`.

## Helpful tips

- Use a valid domain and enable Let's Encrypt for the smoothest experience in production.
- When testing across a LAN, expect browser warnings for self-signed certs.
- If you change `.env`, recreate the stack (`docker compose down` then `docker compose up -d`).

## Useful commands

```bash
# Recreate the stack after config changes
docker compose down
docker compose up -d --force-recreate

# View logs for a service
docker compose logs -f web
```

## References

- Official repo: https://github.com/jitsi/docker-jitsi-meet