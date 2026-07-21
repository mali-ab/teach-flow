Here are the server specifications, software prerequisites, and network port requirements for deploying the **TeachFlow** platform (Go Backend, React Frontend, and Dockerized Jitsi Meet stack):

---

### 💻 1. Minimum Hardware Requirements

| Resource    | Minimum (Testing / Small Scale) | Recommended (Production)                                       |
| ----------- | ------------------------------- | -------------------------------------------------------------- |
| **CPU**     | 2 Cores (64-bit)                | 4+ Cores (Dedicated CPU recommended for WebRTC media decoding) |
| **RAM**     | 4 GB                            | 8 GB or higher                                                 |
| **Storage** | 25 GB SSD                       | 50 GB+ SSD                                                     |
| **Network** | 100 Mbps bandwidth              | 1 Gbps symmetric connection                                    |

---

### 🌐 2. Network & Firewall Configuration

WebRTC media routing and signaling require specific incoming ports to be open on your server or cloud security groups (e.g., UFW, AWS Security Group, DigitalOcean Firewall):

| Port / Protocol | Direction | Component   | Purpose                                       |
| --------------- | --------- | ----------- | --------------------------------------------- |
| **80 / TCP**    | Inbound   | Nginx / Web | HTTP traffic & Let's Encrypt SSL verification |

|
| **443 / TCP** | Inbound | Nginx / Web | HTTPS secure web traffic & WebSocket connections

|
| **10000 / UDP** | Inbound | Jitsi Videobridge (JVB) | WebRTC audio/video media streams |
| **22 / TCP** | Inbound | SSH | Remote server administration |
| **8081 / TCP** _(Optional)_ | Inbound | Go API Server | Direct backend requests (if not proxied behind Nginx/HTTPS)

|

---

### 🛠️ 3. Software Prerequisites

- **Operating System:** Ubuntu 20.04 LTS / Ubuntu 22.04 LTS (or any modern Linux distribution)

- **Docker Engine:** `v20.10+`

- **Docker Compose:** `v2.0+` (Plugin standard: `docker compose`)

- **Go:** `v1.20+` (for compiling/running the backend API)

- **Node.js & npm/yarn:** `Node v18+` (for bundling/serving the React application)

- **Domain & DNS:** A public IP address with a valid fully qualified domain name (FQDN) mapped (e.g., `meet.example.com`).
