#!/usr/bin/env pwsh

# TRAVISTA INTEGRATION - Setup Verification Script
# Run this to check if everything is configured correctly

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TRAVISTA PORTAL SYSTEM - VERIFICATION SCRIPT    " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Helper function
function Test-FileExists {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ $Description" -ForegroundColor Red
        Write-Host "   Missing: $Path" -ForegroundColor Gray
        $script:errors++
        return $false
    }
}

function Test-FolderExists {
    param($Path, $Description)
    
    if (Test-Path $Path -PathType Container) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ $Description" -ForegroundColor Red
        Write-Host "   Missing: $Path" -ForegroundColor Gray
        $script:errors++
        return $false
    }
}

function Warn-Missing {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
    $script:warnings++
}

# Check current directory
Write-Host "📂 Current Directory Check" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray
$currentDir = Get-Location
Write-Host "Working from: $currentDir" -ForegroundColor Gray

# Try to navigate to project root
if (!(Test-Path "public/game")) {
    if (Test-Path "../public/game") {
        Set-Location ..
    }
    elseif (Test-Path "../../public/game") {
        Set-Location ../..
    }
    elseif (Test-Path "../../../public/game") {
        Set-Location ../../..
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "1️⃣  POKEMON HUB WORLD FILES" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

Test-FileExists "public/game/pokemon-style-game/index.html" "Hub world HTML"
Test-FileExists "public/game/pokemon-style-game/index.js" "Hub world main script"
Test-FileExists "public/game/pokemon-style-game/classes.js" "Sprite classes"
Test-FileExists "public/game/pokemon-style-game/portal.js" "Portal system ⭐ NEW"

# Check if portal.js has the Portal class
if (Test-Path "public/game/pokemon-style-game/portal.js") {
    $portalContent = Get-Content "public/game/pokemon-style-game/portal.js" -Raw
    if ($portalContent -match "class Portal") {
        Write-Host "   ✓ Portal class found" -ForegroundColor Gray
    }
    else {
        Warn-Missing "Portal class not found in portal.js"
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "2️⃣  PYGAME SOURCE FILES" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

Test-FileExists "public/game/pygame/main.py" "Pygame main script"
Test-FolderExists "public/game/pygame/assets" "Pygame assets folder"
Test-FileExists "public/game/pygame/build-pygame.ps1" "Build script ⭐ NEW"

# Check if main.py is async
if (Test-Path "public/game/pygame/main.py") {
    $mainPyContent = Get-Content "public/game/pygame/main.py" -Raw
    
    if ($mainPyContent -match "async def main") {
        Write-Host "   ✓ Async main() found" -ForegroundColor Gray
    }
    else {
        Warn-Missing "main.py doesn't have 'async def main()'"
    }
    
    if ($mainPyContent -match "await asyncio.sleep") {
        Write-Host "   ✓ asyncio.sleep() found" -ForegroundColor Gray
    }
    else {
        Warn-Missing "main.py doesn't have 'await asyncio.sleep(0)'"
    }
    
    if ($mainPyContent -match "BASE_DIR") {
        Write-Host "   ✓ BASE_DIR found" -ForegroundColor Gray
    }
    else {
        Warn-Missing "main.py doesn't define BASE_DIR for paths"
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "3️⃣  PYGAME WEB BUILD" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

$webBuildExists = Test-FolderExists "public/game/pygame-web" "Web build folder"

if ($webBuildExists) {
    Test-FileExists "public/game/pygame-web/index.html" "Web build HTML"
    
    $hasWasm = (Get-ChildItem "public/game/pygame-web" -Filter "*.wasm" -ErrorAction SilentlyContinue).Count -gt 0
    if ($hasWasm) {
        Write-Host "✅ WebAssembly files found" -ForegroundColor Green
    }
    else {
        Warn-Missing "No .wasm files found - build may be incomplete"
    }
}
else {
    Write-Host ""
    Write-Host "   🔨 Build not found! Run this to build:" -ForegroundColor Yellow
    Write-Host "   cd public/game/pygame" -ForegroundColor Cyan
    Write-Host "   python -m pygbag ." -ForegroundColor Cyan
    Write-Host "   OR: ./build-pygame.ps1" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "4️⃣  DOCUMENTATION FILES" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

Test-FileExists "public/game/INTEGRATION_GUIDE.md" "Integration guide"
Test-FileExists "public/game/README_COMPLETE_SUMMARY.md" "Complete summary"
Test-FileExists "public/game/QUICK_START.md" "Quick start guide"
Test-FileExists "public/game/test-integration.html" "Test dashboard"

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "5️⃣  PYTHON ENVIRONMENT" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    $errors++
}

$pygbagInstalled = pip show pygbag 2>&1
if ($LASTEXITCODE -eq 0) {
    $version = ($pygbagInstalled | Select-String "Version:").ToString().Split(":")[1].Trim()
    Write-Host "✅ pygbag: $version" -ForegroundColor Green
}
else {
    Write-Host "⚠️  pygbag not installed" -ForegroundColor Yellow
    Write-Host "   Install with: pip install pygbag" -ForegroundColor Gray
    $warnings++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "6️⃣  INTEGRATION CHECKS" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

# Check if index.html includes portal.js
if (Test-Path "public/game/pokemon-style-game/index.html") {
    $htmlContent = Get-Content "public/game/pokemon-style-game/index.html" -Raw
    if ($htmlContent -match "portal\.js") {
        Write-Host "✅ portal.js included in HTML" -ForegroundColor Green
    }
    else {
        Write-Host "❌ portal.js not included in HTML" -ForegroundColor Red
        $errors++
    }
    
    if ($htmlContent -match "portalPrompt") {
        Write-Host "✅ Portal prompt UI found" -ForegroundColor Green
    }
    else {
        Warn-Missing "Portal prompt div not found in HTML"
    }
}

# Check if index.js references portal
if (Test-Path "public/game/pokemon-style-game/index.js") {
    $jsContent = Get-Content "public/game/pokemon-style-game/index.js" -Raw
    if ($jsContent -match "new Portal") {
        Write-Host "✅ Portal instance created in index.js" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Portal instance not found in index.js" -ForegroundColor Red
        $errors++
    }
    
    if ($jsContent -match "checkPortalCollision") {
        Write-Host "✅ Portal collision check added" -ForegroundColor Green
    }
    else {
        Warn-Missing "Portal collision check not found"
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                     SUMMARY                        " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 PERFECT! Everything is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Start local server:" -ForegroundColor Gray
    Write-Host "   npx http-server -p 8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Open test page:" -ForegroundColor Gray
    Write-Host "   http://localhost:8000/public/game/test-integration.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Or open hub world directly:" -ForegroundColor Gray
    Write-Host "   http://localhost:8000/public/game/pokemon-style-game/" -ForegroundColor Cyan
    Write-Host ""
}
elseif ($errors -eq 0) {
    Write-Host "⚠️  Setup is mostly complete with $warnings warning(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The system should work, but check warnings above." -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "❌ Found $errors error(s) and $warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Gray
    Write-Host "Check INTEGRATION_GUIDE.md for detailed setup instructions." -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
