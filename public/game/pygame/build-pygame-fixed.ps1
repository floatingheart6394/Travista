# Build Pygame for Web (Pygbag)
# Run this script from the pygame directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PYGBAG BUILD SCRIPT - TRAVISTA   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the pygame directory
if (!(Test-Path "main.py")) {
    Write-Host "ERROR: main.py not found!" -ForegroundColor Red
    Write-Host "Please run this script from the pygame directory:" -ForegroundColor Yellow
    Write-Host "  cd public/game/pygame" -ForegroundColor Yellow
    Write-Host "  ./build-pygame-fixed.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Step 1: Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Step 2: Check pygbag
Write-Host "Checking pygbag installation..." -ForegroundColor Yellow
$pygbagCheck = pip show pygbag 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "pygbag is installed" -ForegroundColor Green
}
else {
    Write-Host "pygbag not found. Installing..." -ForegroundColor Yellow
    pip install pygbag
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install pygbag" -ForegroundColor Red
        exit 1
    }
    Write-Host "pygbag installed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "Building pygame for web..." -ForegroundColor Cyan
Write-Host "This may take 30-60 seconds..." -ForegroundColor Gray
Write-Host ""

# Step 3: Run pygbag
python -m pygbag .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build completed!" -ForegroundColor Green
Write-Host ""

# Step 4: Check if build output exists
if (Test-Path "build/web") {
    Write-Host "Build output found at: build/web/" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "         BUILD COMPLETE!             " -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Start a local server from project root:" -ForegroundColor Gray
    Write-Host "   npx http-server -p 8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Open Pokemon hub world:" -ForegroundColor Gray
    Write-Host "   http://localhost:8000/public/game/pokemon-style-game/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Walk to portal and press E to test!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Portal target URL: /game/pygame/build/web/index.html" -ForegroundColor Yellow
    Write-Host ""
    
}
else {
    Write-Host "Build output not found!" -ForegroundColor Red
    Write-Host "Expected: build/web/" -ForegroundColor Yellow
}
