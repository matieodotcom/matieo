# MATIEO — Project Setup

> Mortality Insights and Memorial Platform  
> Full-stack monorepo: React + Node.js (TypeScript) + Python ML + Supabase + Cloudinary

---

## 📦 What's in This Repo

```
matieo/
│
├── 📄 CLAUDE.md                  ← AI instructions (read this first)
├── 📄 README.md                  ← You are here
│
├── 📁 frontend/                  ← React + Vite + Tailwind + Radix UI
├── 📁 backend/                   ← Node.js + Express + TypeScript
├── 📁 ml-service/                ← Python + FastAPI (AI/ML features)
├── 📁 e2e/                       ← Playwright end-to-end tests
│
├── 📁 supabase/
│   ├── schema.sql                ← Current DB snapshot (always up to date)
│   └── migrations/               ← Versioned SQL migration files
│
├── 📁 docs/                      ← All project documentation
│   ├── DOCS.md                   ← Single consolidated reference doc
│   └── pages/                    ← Per-page build specs
│
└── 📁 .github/workflows/         ← CI/CD pipelines
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- A Supabase project (dev + prod)
- A Cloudinary account
- A GitHub repo connected to Render + Hostinger

### 1. Clone and install

```bash
git clone https://github.com/your-org/matieo.git
cd matieo

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# ML Service
cd ../ml-service && pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Set up environment variables

```bash
# Frontend
cp frontend/.env.development.example frontend/.env.development

# Backend
cp backend/.env.development.example backend/.env.development

# ML Service
cp ml-service/.env.development.example ml-service/.env.development

# MCP (for Claude Code / Claude Desktop)
cp .env.mcp.example .env.mcp
```

Fill in all values. See `docs/DOCS.md → Environments` for details.

### 3. Apply database schema

```bash
# Via Supabase MCP (preferred — Claude does this automatically)
# Or manually via Supabase SQL editor:
# Copy and run: supabase/migrations/20260101_initial_schema.sql
```

### 4. Run locally

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev          # http://localhost:5173

# Terminal 2 — Backend
cd backend && npm run dev           # http://localhost:3001

# Terminal 3 — ML Service (optional)
cd ml-service && uvicorn src.main:app --reload --port 8000
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Radix UI |
| Backend | Node.js 20 + Express + TypeScript |
| ML Service | Python 3.11 + FastAPI + scikit-learn + spaCy |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Images | Cloudinary |
| Frontend hosting | Hostinger |
| Backend hosting | Render |
| Repo | GitHub |

---

## 🧪 Testing

```bash
# Frontend (Vitest)
cd frontend && npm run test

# Backend (Jest)
cd backend && npm run test

# ML Service (pytest)
cd ml-service && pytest

# E2E (Playwright)
cd e2e && npx playwright test
```

Tests run automatically on every PR via GitHub Actions.

---

## 🤖 Working with Claude

This project is designed to be built with Claude (AI assistant) using MCP tools.

**Claude reads `CLAUDE.md` automatically** when using Claude Code.  
**Claude uses MCP tools** to directly access Supabase, Figma, Cloudinary, and GitHub.

### Connect MCP tools:
- **Claude.ai**: Connect Supabase, Figma, Cloudinary, Context7 from the Tools menu
- **Claude Desktop**: Replace `~/Library/Application Support/Claude/claude_desktop_config.json` with `claude_desktop_config.json` from this repo
- **Claude Code**: Run `claude` from repo root — `.mcp.json` is auto-detected

### Start building:
```
"Read CLAUDE.md, then build the Sign In page. Figma URL: [your-url]"
```

Claude will: read the design → check the DB schema → write migration if needed → build the page → write tests → update all docs.

See `docs/DOCS.md → MCP Setup` for full configuration guide.

---

## 📚 Documentation

All documentation is consolidated in **`docs/DOCS.md`**:

| Section | What's covered |
|---------|---------------|
| Database Schema | All tables, columns, relationships, RLS policies |
| Design System | Colors, components, layout patterns, Radix UI mapping |
| Environments | Dev/prod env vars, Supabase setup, Cloudinary presets, Render, Hostinger |
| MCP Setup | Step-by-step for Claude Desktop, Claude Code, and Claude.ai |
| ML Architecture | How Node ↔ Python communicate, ML feature roadmap |
| Page Specs | Per-page build notes (auth, create-memorial, etc.) |

---

## 🌿 Git Workflow

```
main   ← Production (protected, deploy via PR only)
dev    ← Development (default working branch)
feature/page-name  ← Feature branches
```

**Flow**: `feature/*` → PR to `dev` → test → PR to `main` → auto-deploy

---

## 🔐 Security Notes

- Never commit `.env` files — only `.env.*.example` files are committed
- `SUPABASE_SERVICE_ROLE_KEY` lives in backend only — never frontend
- All Cloudinary image management goes through the backend for signed ops
- RLS is enabled on every Supabase table
