# 🎮 Quick Test Guide - Pygame In-Page Overlay

## ✅ Testing the Integration

### Current Status
🟢 **Server Running**: http://localhost:8000  
🟢 **Game Open**: Pokemon Hub World  
🟢 **Overlay**: Ready to test  

---

## 🧪 Test Steps

### 1️⃣ Navigate to Portal
- Use **WASD** or **Arrow Keys** to move
- Walk toward the **glowing cyan portal** (fireball sprite)
- Position should be around coordinates (200, 300)

### 2️⃣ Verify Portal Prompt
When near portal, you should see:
```
🌀 Press E to enter Portal 🌀
```
- Prompt appears at top center
- Blue background with white text
- White border around prompt

### 3️⃣ Activate Portal
- Press **E** key while near portal
- **Expected behavior:**
  - Pokemon game **freezes** (player stops moving)
  - Black overlay **appears** covering screen
  - Pygame game **loads** in center
  - Red "← EXIT GAME" button appears top-right

### 4️⃣ Verify Pygame Loading
- Watch for pygame loading screen
- WebAssembly should initialize
- Platformer game should start
- You should see:
  - Yellow background
  - Block platforms
  - Character (VirtualGuy)
  - Fruits to collect

### 5️⃣ Test Pygame Controls
- **Left Arrow**: Move left
- **Right Arrow**: Move right
- **Space/Up Arrow**: Jump
- Collect fruits (score increases)
- Avoid fire and chainsaws

### 6️⃣ Exit Pygame
- Click **"← EXIT GAME"** button (top-right)
- **Expected behavior:**
  - Overlay **disappears**
  - Pygame **unloads**
  - Pokemon game **resumes** exactly where it was
  - Player can move again

### 7️⃣ Re-enter Portal (Optional)
- Walk back to portal
- Press **E** again
- Verify portal can be reactivated
- Pygame should reload fresh

---

## ✅ Success Criteria

### Visual Checks
- [ ] Portal glows with cyan animation
- [ ] Prompt appears when near portal
- [ ] Overlay is full-screen black
- [ ] Pygame loads inside overlay
- [ ] Exit button is visible and red
- [ ] No new browser tabs open

### Functional Checks
- [ ] Pokemon game pauses when overlay opens
- [ ] Pokemon game resumes when overlay closes
- [ ] Pygame keyboard controls work
- [ ] Exit button closes overlay
- [ ] Can re-enter portal multiple times
- [ ] No page reload occurs

### Technical Checks
- [ ] No console errors
- [ ] Iframe loads correct URL
- [ ] Z-index layering correct
- [ ] `isPokemonGamePaused` changes state
- [ ] Audio from both games works

---

## 🐛 Debugging

### Open Browser Console
Press **F12** to open DevTools

### Check Portal Activation
```javascript
// Should see when pressing E near portal
🌀 Portal activated! Opening pygame world in overlay...
✅ Pygame overlay opened, Pokemon game paused
```

### Check State Variables
```javascript
// In console, type:
isPokemonGamePaused
// Should be true when overlay is open

isPokemonGameActive()
// Should be false when overlay is open
```

### Check DOM Elements
```javascript
// Verify overlay exists:
document.getElementById('pygamePortalOverlay')

// Verify iframe exists:
document.getElementById('pygameIframe')

// Check iframe src:
document.getElementById('pygameIframe').src
// Should be: http://localhost:8000/game/pygame/build/web/index.html
```

### Common Issues

#### Issue: Portal prompt not showing
**Fix**: 
- Check if `showPortalPrompt()` is called
- Verify collision detection with `checkPortalCollision()`
- Walk directly over portal center

#### Issue: Pygame not loading
**Fix**:
- Check console for iframe errors
- Verify path: `/game/pygame/build/web/index.html`
- Rebuild pygame: `cd public/game/pygame && .\build-pygame-fixed.ps1`

#### Issue: Keyboard not working in pygame
**Fix**:
- Click inside the game area
- Wait for iframe to focus (500ms delay)
- Check if pygame finished loading

#### Issue: Pokemon game still animating
**Fix**:
- Verify `isPokemonGamePaused = true` is set
- Check if `isPokemonGameActive()` returns false
- Ensure early return in `animate()` function

---

## 📸 Expected Screenshots

### Before Activation
```
┌────────────────────────────────┐
│   🌀 Press E to enter Portal   │ ← Prompt
├────────────────────────────────┤
│                                │
│    [Pokemon Hub World]         │
│     Player moving around       │
│     Portal glowing (cyan)      │
│                                │
└────────────────────────────────┘
```

### After Activation (Overlay Open)
```
┌────────────────────────────────┐
│               [← EXIT GAME] ←──┼── Red button
├────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░                            ░ │
│ ░    [Pygame Platformer]    ░ │ ← Iframe
│ ░    Yellow background       ░ │
│ ░    Character jumping       ░ │
│ ░    Collecting fruits       ░ │
│ ░                            ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────┘
     Black overlay (95% opacity)
```

### After Closing Overlay
```
┌────────────────────────────────┐
│                                │
│    [Pokemon Hub World]         │
│     Player at same position    │ ← Resumed
│     Portal still glowing       │
│                                │
└────────────────────────────────┘
```

---

## 📊 Performance Metrics

### Expected Load Times
- Portal activation: **< 100ms**
- Pygame iframe load: **2-5 seconds**
- Overlay close: **< 50ms**

### Memory Usage
- Pokemon game (paused): ~50-100 MB
- Pygame running: ~100-200 MB
- Total overhead: ~150-300 MB

### Frame Rates
- Pokemon game (active): **60 FPS**
- Pokemon game (paused): **0 FPS** (not rendering)
- Pygame game: **60 FPS**

---

## ✅ Test Complete Checklist

After testing, verify:

- [x] Server is running
- [ ] Pokemon game loads correctly
- [ ] Portal is visible and animated
- [ ] Press E activates portal
- [ ] Overlay appears full-screen
- [ ] Pygame loads in overlay
- [ ] Pokemon game is paused
- [ ] Pygame controls work
- [ ] Exit button closes overlay
- [ ] Pokemon game resumes
- [ ] No new tabs opened
- [ ] No page reloads
- [ ] Can re-activate portal
- [ ] No console errors

---

## 🎉 Success!

If all checks pass, the integration is **fully functional**! 

The pygame game now runs seamlessly as an in-page overlay within the Travista web application.

---

**Test Date**: January 23, 2026  
**Tester**: [Your Name]  
**Status**: ✅ Ready for testing  
**Server**: http://localhost:8000  
**Game URL**: http://localhost:8000/game/pokemon-style-game/
