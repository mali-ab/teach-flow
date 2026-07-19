# TeachFlow 🎥✨

A sleek, lightweight, and minimalistic online video conferencing platform. This application integrates a high-performance **Go (Golang)** backend with a modern **React & TypeScript** frontend, embedding **Jitsi Meet** for seamless, low-latency video and audio communication.

---

## 🚀 Key Features

- **Instant Meetings:** Create or join public/private conference rooms instantly.
- **Minimalistic UI:** Clean, distraction-free interface built with React & TypeScript.
- **Secure Video/Audio:** Robust, encrypted communications powered by Jitsi Meet.
- **Lightweight Backend:** Fast Go backend handling session logic, room token generation (JWT if configured), and route management.
- **Responsive Design:** Optimized for both desktop and mobile web viewports.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite (or Create React App), `@jitsi/react-sdk`
- **Backend:** Go (Golang), Fiber / Gin (HTTP framework), JWT (for secure Jitsi authentication)
- **Video Engine:** Jitsi Meet (Self-hosted or Public Meet Instance)

---

## 📁 Repository Structure

```text
├── backend/               # Go API server
│   ├── main.go            # Entry point
│   ├── handlers/          # Room & Token controller logic
│   ├── go.mod             # Go dependencies
│   └── .env.example       # Backend environment variables
│
├── frontend/              # React + TypeScript App
│   ├── src/
│   │   ├── components/    # Meeting UI, Jitsi Frame wrapper
│   │   ├── App.tsx        # Main routing & layout
│   │   └── main.tsx       # TSX entrypoint
│   ├── package.json       # Frontend dependencies
│   └── .env.example       # Frontend environment variables
│
└── README.md              # Project documentation
```

⚙️ Getting Started
Prerequisites
Go (v1.18+)

Node.js (v18+) & npm / yarn / pnpm

A Jitsi Meet Server instance (or default to meet.jit.si for development)

1. Backend Setup (Go)
Navigate to the backend directory:

Bash
cd backend
Copy the example environment file and configure your port:

Bash
cp .env.example .env
Install dependencies and start the Go server:

Bash
go mod tidy
go run main.go
The backend should now be running on http://localhost:8080.

2. Frontend Setup (React + TypeScript)
Navigate to the frontend directory:

Bash
cd ../frontend
Copy the example environment file and define your Go backend URL & Jitsi Domain:

Bash
cp .env.example .env
(Example variables inside .env:)

Фрагмент кода
VITE_BACKEND_URL=http://localhost:8080
VITE_JITSI_DOMAIN=meet.jit.si
Install the dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
The client app should now be live on http://localhost:5173 (or http://localhost:3000).

🔗 How Jitsi is Embedded (React/TS)
We utilize the official Jitsi Meet React SDK to render the iframe dynamically. Below is the core integration pattern:

TypeScript
import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk'; //

interface MeetingProps {
  roomName: string;
  userName: string;
}

export const VideoConference: React.FC<MeetingProps> = ({ roomName, userName }) => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <JitsiMeeting 'meet.jit.si'} // DISABLE_JOIN_LEAVE_NOTIFICATIONS: configOverwrite="{{" disableModeratorIndicator: displayName: domain="{import.meta.env.VITE_JITSI_DOMAIN" false, getIFrameRef="{(iframeRef)" interfaceConfigOverwrite="{{" roomName="{roomName}" startScreenSharing: startWithAudioMuted: true, userInfo="{{" userName, || }}> {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }} //
      />
    </div>
  );
};
🐳 Running with Docker (Production Optional)
If you have a customized Docker-compose Jitsi setup alongside this application, make sure your host directories are writable:

Bash
# If running Jitsi in Docker and facing permission blocks
sudo chown -R 1000:1000 ~/.jitsi-meet-cfg
sudo chmod -R 775 ~/.jitsi-meet-cfg
🔒 Security & JWT (Optional)
If your self-hosted Jitsi instance is protected, your Go backend can sign securely signed JWTs (JSON Web Tokens).

When a user requests to join Room-A, the React app hits /api/token on the Go backend.

The Go backend validates the request, signs a token using your JITSI_APP_SECRET, and returns the token.

React passes this token to the jwt prop inside <JitsiMeeting jwt={token} />.

📄 License
This project is licensed under the MIT License. Feel free to use, modify, and distribute.