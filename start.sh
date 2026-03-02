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
echo "🚀 Starting Claude Code..."
claude