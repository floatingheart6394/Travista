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
    targetUrl = '/game/pygame/build/web/index.html',
    cols = 3,
    rows = 2
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
    this.cols = cols
    this.rows = rows
  }

  draw() {
    // Draw portal sprite with grid layout
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    // Calculate frame position in grid
    const frameWidth = this.image.width / this.cols
    const frameHeight = this.image.height / this.rows
    const col = this.frames.val % this.cols
    const row = Math.floor(this.frames.val / this.cols)

    const crop = {
      position: {
        x: col * frameWidth,
        y: row * frameHeight
      },
      width: frameWidth,
      height: frameHeight
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: frameWidth,
      height: frameHeight
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      crop.width * this.scale,
      crop.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
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
