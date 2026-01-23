/**
 * PORTAL SYSTEM FOR PYGAME INTEGRATION
 * =====================================
 * This creates an animated portal that opens the pygame game in an overlay.
 * The portal acts as a gateway from the Pokemon hub world to the platformer.
 */

// Global animation ID for pausing/resuming
let pokemonGameAnimationId = null;
let isPokemonGamePaused = false;
let originalAlert = typeof window !== 'undefined' ? window.alert : null;

function clearBeforeUnload(iframe) {
  try {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.onbeforeunload = null
    }
  } catch (e) {
    /* ignore cross-origin protection */
  }
  try {
    window.onbeforeunload = null
  } catch (e) {
    /* ignore */
  }
}

class Portal extends Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    scale = 2,
    targetUrl = '/game/pygame/build/web/index.html'
  }) {
    super({
      position,
      image,
      frames,
      animate: true,
      scale
    })
    
    this.targetUrl = targetUrl
    this.isActivated = false
    this.glowIntensity = 0
    this.glowDirection = 1
  }

  draw() {
    // Draw glowing effect behind portal
    c.save()
    c.globalAlpha = this.glowIntensity
    c.fillStyle = '#00ffff'
    c.beginPath()
    c.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width * 0.6,
      0,
      Math.PI * 2
    )
    c.fill()
    c.restore()

    // Update glow animation
    this.glowIntensity += 0.01 * this.glowDirection
    if (this.glowIntensity >= 0.5) this.glowDirection = -1
    if (this.glowIntensity <= 0.2) this.glowDirection = 1

    // Draw portal sprite
    super.draw()
  }

  /**
   * Opens the pygame game in an in-page overlay
   * Pauses the Pokemon game while pygame is active
   */
  activate(playerData = {}) {
    if (this.isActivated) return
    
    this.isActivated = true
    
    // Save player state for continuity (optional)
    localStorage.setItem('travista_player_state', JSON.stringify({
      fromWorld: 'pokemon-hub',
      timestamp: Date.now(),
      playerData: playerData
    }))
    
    // Open pygame game in overlay
    console.log('🌀 Portal activated! Opening pygame world in overlay...')
    openPygamePortal(this.targetUrl)
    
    // Reset activation after delay to allow re-entry
    setTimeout(() => {
      this.isActivated = false
    }, 2000)
  }
}

/**
 * Check if player is colliding with portal
 */
function checkPortalCollision({ player, portal }) {
  return rectangularCollision({
    rectangle1: player,
    rectangle2: portal
  })
}

/**
 * Display prompt when player is near portal
 */
function showPortalPrompt(show = true) {
  const promptElement = document.querySelector('#portalPrompt')
  if (promptElement) {
    promptElement.style.display = show ? 'flex' : 'none'
  }
}

/**
 * PYGAME OVERLAY CONTROL FUNCTIONS
 * ==================================
 */

/**
 * Opens the pygame game in a full-screen overlay
 * Pauses the Pokemon game loop
 * @param {string} gameUrl - URL to the pygame game
 */
function openPygamePortal(gameUrl) {
  const overlay = document.getElementById('pygamePortalOverlay')
  const iframe = document.getElementById('pygameIframe')
  
  if (!overlay || !iframe) {
    console.error('Pygame overlay elements not found!')
    return
  }
  
  // Pause Pokemon game
  isPokemonGamePaused = true

  // Suppress any alert popups from the embedded game
  if (originalAlert) {
    window.alert = () => {}
  }

  // Ensure no beforeunload prompt lingers
  clearBeforeUnload(iframe)

  // Also clear once the iframe loads
  iframe.addEventListener('load', () => clearBeforeUnload(iframe), { once: true })

  // Load pygame game in iframe
  iframe.src = gameUrl
  
  // Show overlay
  overlay.classList.add('active')
  
  // Focus iframe for keyboard input
  setTimeout(() => {
    iframe.focus()
  }, 500)
  
  console.log('✅ Pygame overlay opened, Pokemon game paused')
}

/**
 * Closes the pygame overlay and resumes Pokemon game
 */
function closePygamePortal() {
  const overlay = document.getElementById('pygamePortalOverlay')
  const iframe = document.getElementById('pygameIframe')
  
  if (!overlay || !iframe) {
    console.error('Pygame overlay elements not found!')
    return
  }
  
  // Hide overlay
  overlay.classList.remove('active')
  
  // Unload iframe (stops pygame game)
  iframe.src = 'about:blank'

  // Remove beforeunload prompts
  clearBeforeUnload(iframe)
  
  // Resume Pokemon game
  isPokemonGamePaused = false

   // Restore alert if it was suppressed
  if (originalAlert) {
    window.alert = originalAlert
  }
  
  console.log('✅ Pygame overlay closed, Pokemon game resumed')
}

/**
 * Checks if Pokemon game should be paused
 * Call this in your game loop
 */
function isPokemonGameActive() {
  return !isPokemonGamePaused
}
