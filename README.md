# Smithy — AI Site Builder

Describe your site in plain English, watch it get built, preview it live, and deploy to the web in seconds.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Client (React + Vite)                          │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Chat Panel   │  │    Preview Panel       │   │
│  │  - Messages   │  │    - Live iframe       │   │
│  │  - Input      │  │    - Code viewer       │   │
│  │  - Streaming  │  │    - Device toggle     │   │
│  └──────────────┘  │    - Deploy button      │   │
│                     └────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ SSE (streaming)
┌──────────────────────┴──────────────────────────┐
│  Server (Express)                                │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  /api/generate│  │    /api/deploy         │   │
│  │  Claude API   │  │    here.now REST API   │   │
│  │  Streaming    │  │    (3-step publish)    │   │
│  └──────────────┘  └────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  Project Store (in-memory for MVP)        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

   This starts both the backend (port 3001) and frontend (port 5173).

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

## How It Works

1. **User enters a prompt** describing their site
2. **Backend streams** the prompt to Claude API with a specialized system prompt
3. **Claude generates** a complete, self-contained HTML file
4. **Frontend displays** the response in chat and renders the HTML in a live preview
5. **User iterates** — asks for changes, and Claude updates the code in context
6. **Deploy** — the server publishes to here.now and returns a live URL + claim link

## Deploy

Deployment uses the [here.now](https://here.now) API — a free static hosting service. No API key needed for anonymous publishes. The flow is:

1. `POST /api/v1/publish` — reserve a slug and get presigned upload URLs
2. `PUT` to the presigned URL — upload the HTML
3. `POST /api/v1/publish/:slug/finalize` — make it live

Sites are live for 24 hours unless claimed. A claim URL is returned so users can take permanent ownership.

## Colophon

Built with:

- **[Claude](https://anthropic.com)** — AI model that generates site code (Anthropic SDK, `claude-sonnet-4-20250514`)
- **[Claude Code](https://claude.com/claude-code)** — AI coding agent used to build Smithy itself
- **[React](https://react.dev)** — UI framework (MIT)
- **[Vite](https://vite.dev)** — Frontend build tool (MIT)
- **[Express](https://expressjs.com)** — Node.js server framework (MIT)
- **[Lucide](https://lucide.dev)** — Icon set (ISC)
- **[Inter](https://rsms.me/inter/)** — Typeface (OFL)
- **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** — Monospace typeface (OFL)
- **[here.now](https://here.now)** — Free static site hosting for deployment
