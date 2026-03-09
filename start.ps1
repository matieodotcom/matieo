# start.ps1 — Load MCP credentials and start Claude Code
# Usage: .\start.ps1
# Run from repo root: cd matieo && .\start.ps1

# Load .env.mcp and export all variables
Get-Content .env.mcp | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

Write-Host "✅ MCP credentials loaded"
Write-Host "   Supabase:   $($env:SUPABASE_ACCESS_TOKEN.Substring(0, [Math]::Min(8, $env:SUPABASE_ACCESS_TOKEN.Length)))..."
Write-Host "   GitHub:     $($env:GITHUB_PAT.Substring(0, [Math]::Min(8, $env:GITHUB_PAT.Length)))..."
Write-Host "   Figma:      $($env:FIGMA_ACCESS_TOKEN.Substring(0, [Math]::Min(8, $env:FIGMA_ACCESS_TOKEN.Length)))..."
Write-Host "   Cloudinary: $env:CLOUDINARY_CLOUD_NAME"
Write-Host ""

$REPO_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🖥️  Starting backend (port 3001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$REPO_ROOT\backend'; npm run dev"

Write-Host "🖥️  Starting frontend (port 5173)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$REPO_ROOT\frontend'; npm run dev"

Write-Host ""
Write-Host "🚀 Starting Claude Code..."
claude