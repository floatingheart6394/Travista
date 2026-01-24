const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'

// Create fullscreen battle background
let battleBackground

function createBattleBackground() {
  battleBackground = new Sprite({
    position: {
      x: 0,
      y: 0
    },
    image: battleBackgroundImage
  })
}

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
  // Create fullscreen battle background
  createBattleBackground()
  
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  // Create monsters with responsive positioning for fullscreen
  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  
  // Adjust positions based on canvas size
  draggle.position.x = canvas.width * 0.80  // 78% from left (enemy on right)
  draggle.position.y = canvas.height * 0.20 // 15% from top
  
  emby.position.x = canvas.width * 0.2    // 20% from left (player on left)
  emby.position.y = canvas.height * 0.55  // 55% from top (lower position)
  
  renderedSprites = [draggle, emby]
  queue = [] 

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  // our event listeners for our buttons (attack)
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0
              })

              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      }

      // draggle or enemy attacks right here
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })

          queue.push(() => {
            // fade back to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'

                gsap.to('#overlappingDiv', {
                  opacity: 0
                })

                battle.initiated = false
                audio.Map.play()
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  
  // Draw fullscreen battle background
  c.drawImage(
    battleBackgroundImage,
    0, 0,
    battleBackgroundImage.width,
    battleBackgroundImage.height,
    0, 0,
    canvas.width,
    canvas.height
  )

  console.log(battleAnimationId)

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
