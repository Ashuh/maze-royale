import { Player } from './player.js'
import { Game } from './game.js'

const canvas = document.querySelector('canvas')
canvas.width = innerWidth
canvas.height = innerHeight
const context = canvas.getContext('2d')
const game = new Game(
    new Player(canvas.width / 2, canvas.height / 2, 0, 0, 15, 'blue')
)

addEventListener('click', (event) => {
    game.onMouseClick()
})

addEventListener('mousemove', (event) => {
    game.setMousePosition(event.clientX, event.clientY)
})

let keyW = false
let keyA = false
let keyS = false
let keyD = false

addEventListener('keydown', (event) => {
    switch (event.key) {
    case 'w':
        keyW = true
        break
    case 'a':
        keyA = true
        break
    case 's':
        keyS = true
        break
    case 'd':
        keyD = true
        break
    }
    game.setDirectionalKeys(keyW, keyA, keyS, keyD)
})

addEventListener('keyup', (event) => {
    switch (event.key) {
    case 'w':
        keyW = false
        break
    case 'a':
        keyA = false
        break
    case 's':
        keyS = false
        break
    case 'd':
        keyD = false
        break
    }
    game.setDirectionalKeys(keyW, keyA, keyS, keyD)
})

requestAnimationFrame(gameLoop)

function gameLoop() {
    game.update()
    context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    game.draw(context)
    requestAnimationFrame(gameLoop)
}
