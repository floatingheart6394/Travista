# 🚀 QUICK START GUIDE
## Get Your Portal System Running in 5 Minutes

---

## Step 1: Build Pygame for Web ⏱️ 2 min

Open PowerShell in the pygame directory:

```powershell
cd public\game\pygame
python -m pygbag .
```

**Expected output:**
```
* Building for web...
* Bundling assets...
* Creating build/web/
✓ Build complete!
```

**Troubleshooting:**
- If `pygbag` not found: `pip install pygbag`
- If Python error: Ensure Python 3.11+

---

## Step 2: Deploy the Build ⏱️ 1 min

### Automated (Recommended):
```powershell
./build-pygame.ps1
```

### Manual:
```powershell
# Create target folder
New-Item -ItemType Directory -Path ..\pygame-web -Force

# Copy build files
Copy-Item -Path build\web\* -Destination ..\pygame-web\ -Recurse -Force
```

**Verify:**
```
public/game/pygame-web/index.html should exist
```

---

## Step 3: Start Local Server ⏱️ 30 sec

From project root:

```bash
# Option 1: Node.js
npx http-server -p 8000

# Option 2: Python
python -m http.server 8000

# Option 3: Vite (if you're using React)
npm run dev
```

**Expected:**
```
Starting server at http://localhost:8000
```

---

## Step 4: Test! ⏱️ 1 min

### Option A: Test Dashboard
Open in browser:
```
http://localhost:8000/public/game/test-integration.html
```

Click "Test Portal System"

### Option B: Direct Access
```
http://localhost:8000/public/game/pokemon-style-game/
```

**What to expect:**
1. Pokemon hub world loads
2. Walk around with WASD keys
3. Find the glowing portal sprite
4. See "🌀 Press E to enter Portal 🌀"
5. Press **E**
6. Pygame opens in new tab! 🎉

---

## 🎮 Controls

### Pokemon Hub World
- **W/A/S/D** - Move character
- **E** - Enter portal (when near)
- **Space** - Talk to NPCs
- **Click** - Start music

### Pygame Platformer
- **Arrow Keys** - Move
- **Up/Space** - Jump (double jump available)

---

## ✅ Success Checklist

If you see this, you're good:

- ✅ Pokemon game loads (no console errors)
- ✅ Portal sprite appears (glowing effect)
- ✅ "Press E" message shows when near portal
- ✅ Pressing E opens new tab
- ✅ Pygame game runs in the new tab
- ✅ Character moves smoothly
- ✅ Platforms and traps are visible

---

## ⚠️ Common Issues & Fixes

### Portal doesn't appear
**Fix:**
1. Open browser console (F12)
2. Look for error: "Portal is not defined"
3. Check `portal.js` loaded: view source, find `<script src="portal.js">`

### "Press E" doesn't show
**Fix:**
1. Check HTML has `<div id="portalPrompt">`
2. Verify collision detection: add `console.log('near portal')` in `checkPortalCollision()`

### Pygame shows blank screen
**Fix:**
1. Check browser console for asset errors
2. Verify `BASE_DIR` in main.py
3. Ensure assets folder is in pygame directory
4. Rebuild: `python -m pygbag .`

### New tab blocked (popup blocker)
**Fix:**
1. Click popup blocker icon in browser address bar
2. Allow popups for localhost
3. Try again

### Pygame crashes immediately
**Fix:**
1. Ensure `await asyncio.sleep(0)` is in game loop
2. Check no `pygame.quit()` or `quit()` calls
3. Verify `asyncio.run(main(window))` at bottom

---

## 📁 Quick File Check

Run these commands to verify setup:

```powershell
# Check Pokemon files
Test-Path public\game\pokemon-style-game\index.html
Test-Path public\game\pokemon-style-game\portal.js

# Check Pygame files
Test-Path public\game\pygame\main.py
Test-Path public\game\pygame\assets

# Check Web build
Test-Path public\game\pygame-web\index.html
```

All should return `True`

---

## 🎨 Quick Customization

### Move the Portal

Edit `pokemon-style-game/index.js` line ~25:

```javascript
const portal = new Portal({
  position: {
    x: 500,  // Change this
    y: 200   // And this
  },
  // ...
})
```

Save, refresh browser, portal moves!

---

## 📚 Need More Help?

- **Full Documentation:** `INTEGRATION_GUIDE.md`
- **Architecture:** `ARCHITECTURE_DIAGRAM.js`
- **Complete Summary:** `README_COMPLETE_SUMMARY.md`
- **Browser Console:** Press F12 for errors

---

## 🎉 You're Done!

Your portal system is live! Players can now:
1. Explore the Pokemon hub world
2. Enter the portal
3. Play the pygame platformer
4. Return to hub world

**Next Steps:**
- Add custom portal sprite
- Implement score tracking between games
- Create more portals to other mini-games
- Deploy to production server

---

**Time to completion:** ~5 minutes  
**Difficulty:** Easy  
**Dependencies:** Python 3.11+, pygbag, local server  
**Status:** Ready to play! ✅
