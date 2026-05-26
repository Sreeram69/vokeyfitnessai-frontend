# 🏋️ VokeyFitness AI: Premium Conversational Fitness & Nutrition SaaS

VokeyFitness is an enterprise-grade, high-performance, and AI-driven fitness SaaS platform engineered for athletes who demand data consistency, dynamic tracking, and intelligent conversational coaching. 

Built using a modern decoupled architecture, VokeyFitness features a buttery-smooth GPU-accelerated client, a stateful Gemini-powered RAG assistant, hands-free conversational voice interfaces, and horizontally scalable clustered backend systems.

---

## ⚡ Key Architectural Upgrades & Core Features

### 1. 🚀 Buttery-Smooth GPU-Accelerated UI (60+ FPS)
* **Zero CSS-Motion Conflicts**: Extracted legacy `transition-all` declarations on card overlays, preventing the browser from dragging down Framer Motion spring translations.
* **Compositing Compositor Layers**: Integrated CSS `will-change: transform` and premium cubic-bezier timing controls (`cubic-bezier(0.16, 1, 0.3, 1)`) to offload repaint calculations to the GPU, guaranteeing lag-free container lifts.

### 2. 🗣️ Conversational Voice AI (Google AI Style)
* **Voice Search (Speech-to-Text)**: Features interactive, on-demand voice capture using the browser's native `SpeechRecognition` API. Clicking the microphone starts a session inside a trusted user click gesture, displaying a red pulsing radar halo (`animate-mic-pulse`) and dynamic soundwaves.
* **Voice Replies (Text-to-Speech)**: Implements natural English vocal narrators using the `speechSynthesis` API. It features custom regular expression filters that strip markdown syntax (`**`, `-`, backticks) for organic pacing.
* **Symmetric Audio Playback**: Includes header global voice toggles (`Volume2` / `VolumeX`) and individual speaker triggers adjacent to all conversation bubbles, animating bouncing equalizers (`animate-voice-wave`) in real-time.

### 3. 📊 Dynamic Date-Range Analytics Filtering
* **Period-Based Slicing**: Segmented dashboard controls (`TODAY`, `MONTH`, `YEAR`, `ALL TIME`) that query sub-100ms backend aggregates.
* **Adaptive Chart Segmentations**: Charts (Recharts) automatically re-chunk their series arrays based on selection:
  * **Today**: Splits logs into 4-hour intervals (hourly flows).
  * **Month**: Groups logs into weekly blocks.
  * **Year**: Groups logs into 12 calendar months.

### 4. 🧠 Stateful AI Progression RAG Loop
* **Gemini 2.5 Flash Integration**: Injects the athlete's physical profile (height, weight, calorie guidelines, water targets) and their last 5 completed workout sessions into the prompt context.
* **Adaptive Load Engine**: Automatically prescribes **Progressive Overload** (weight/reps increments) if consistent completed volume is detected, or shifts to active **Deload/Stabilization** loops if consistency trends downward.

### 5. 🐳 Multi-Stage Docker Containerization
* **React Nginx Container**: Builds production client assets inside a secure Node 20 environment (`npm ci`), copying static bundles into a production-hardened Nginx Alpine server.
* **SPA Routing Fallback**: Features a custom `nginx.conf` routing block to handle React HTML5 history router deep links (preventing 404 errors) and enforces security headers (`CSP`, `X-Frame-Options`).
* **Multi-Container Orchestration**: Declares four bridged services (`mongodb`, `redis`, `backend`, `frontend`) with persistent Docker volumes to secure fitness logs on restarts.

---

## 🛠️ The VokeyFitness Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT SYSTEM                                    |
+-----------------------------------------------------------------------------------+
|  React (Hooks, Context) | Redux Toolkit (State) | TailwindCSS (Premium UI Elements)|
|  Framer Motion (Fluid Animations) | Recharts (Responsive Graphs Analytics)        |
+-----------------------------------------------------------------------------------+
                                         | (REST APIs, SSE Channels)
                                         v
+-----------------------------------------------------------------------------------+
|                                  SERVER SYSTEM                                    |
+-----------------------------------------------------------------------------------+
|  Node.js (LTS 20) | Express.js Framework | JWT authentication | Nodemailer SMTP   |
|  Mongoose (MongoDB Database Modeler) | Upstash Serverless Redis (Blacklists, TTLs)|
+-----------------------------------------------------------------------------------+
```

---

## 💻 Developer Setup & Installation Manual

### 1. Clone & Install Dependencies
First, clone the repositories. In your local workspaces:

#### Client Setup
```bash
cd vokeyfitness-client
npm install
```

#### Backend Setup
```bash
cd vokeyfitness-backend
npm install
```

### 2. Configure Environment Keys
Create a `.env` file in the root of the backend directory (refer to `.env.example`):
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vokeyfitness
JWT_SECRET=your_super_secure_jwt_secret_key_2026
GEMINI_API_KEY=your_google_gemini_developer_api_key

# Optional: Enable high-speed Redis Blacklists & Task queues
REDIS_URL=redis://localhost:6379
```

Create a `.env` file in the root of the client directory:
```ini
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

#### Launch Backend Server
```bash
cd vokeyfitness-backend
npm run dev
```

#### Launch Client Host
```bash
cd vokeyfitness-client
npm run dev
```
Open `http://localhost:5173` in your browser!

### 4. Seed Exercises Database
The server has a built-in Mongoose exercise catalog migration tool. To seed 185 premium exercises in MongoDB, run:
```bash
cd vokeyfitness-backend
node scripts/migrateExercises.js
```

---

## 📦 Production Deployment Guide (Vercel & Render)

1. **Deploy Database**: Set up a free sandbox cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and set up IP whitelist rules (`0.0.0.0/0`).
2. **Deploy Backend API**: Create a Web Service on [Render](https://render.com/), link your GitHub backend repo, select Node environment, and paste your `.env` keys.
3. **Deploy Frontend Client**: Create a static site project on [Vercel](https://vercel.com/), link your client repo, configure the build command as `npm run build`, output directory as `dist`, and set the `VITE_API_URL` environment key to your Render server link.


