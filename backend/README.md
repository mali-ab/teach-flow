# TeachFlow Go Backend

This backend provides a lightweight API for TeachFlow and can generate Jitsi meeting join URLs.

## What it supports

- `POST /api/auth/register` — register a new user and return a token
- `POST /api/auth/login` — login with email/password
- `POST /api/meetings` — create a meeting room
- `GET /api/meetings/{roomName}/join` — build a Jitsi join URL for a room
- `GET /api/health` — health check

## Setup

1. Install Go 1.22+.
2. Open a terminal in `backend/`.
3. Copy `.env.example` to `.env` and edit values.
4. Run:

```powershell
cd backend
go run main.go
```

## Environment variables

- `BACKEND_PORT` - port for the server (default `8080`)
- `PASSWORD_SALT` - optional password salt for in-memory hashes
- `JITSI_BASE_URL` - your Jitsi deployment base URL
- `JITSI_APP_ID` - optional Jitsi JWT app ID
- `JITSI_APP_SECRET` - optional Jitsi JWT secret

## Running with frontend

The frontend already uses `/api` paths for most requests.

For local development, you can run the backend on `http://localhost:8080` and the frontend on `http://localhost:3000`.

If you use the frontend Vite proxy, relative `/api` calls will forward automatically.

## Jitsi integration

- If `JITSI_APP_SECRET` is empty, join URLs are returned as:
  `http://<jitsi-base-url>/<roomName>`
- If `JITSI_APP_SECRET` is configured, the backend signs a JWT and returns a URL like:
  `http://<jitsi-base-url>/<roomName>?jwt=<token>`

## Notes

- Data is stored in memory for this starter implementation.
- Restarting the backend will clear users, sessions, and meetings.
- Use a real database and stronger password hashing for production.
