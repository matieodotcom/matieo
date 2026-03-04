#!/bin/bash
# start.sh — Load MCP credentials and start Claude Code
# Usage: ./start.sh
# Run from repo root: cd matieo && ./start.sh

set -a  # auto-export all variables
source .env.mcp
set +a

echo "✅ MCP credentials loaded"
echo "   Supabase: ${SUPABASE_ACCESS_TOKEN:0:8}..."
echo "   GitHub:   ${GITHUB_PAT:0:8}..."
echo "   Figma:    ${FIGMA_ACCESS_TOKEN:0:8}..."
echo "   Cloudinary: ${CLOUDINARY_CLOUD_NAME}"
echo ""
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🖥️  Starting backend (port 3001)..."
mintty --title "Backend — MATIEO" bash -c "cd '$REPO_ROOT/backend' && npm run dev; exec bash" &

echo "🖥️  Starting frontend (port 5173)..."
mintty --title "Frontend — MATIEO" bash -c "cd '$REPO_ROOT/frontend' && npm run dev; exec bash" &

echo ""
echo "🚀 Starting Claude Code..."
claude