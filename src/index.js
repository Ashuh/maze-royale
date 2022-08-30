import { Point } from './point.js'
import { Player } from './player.js'
import { Game } from './game.js'

const canvasBg = document.getElementById('canvas_bg')
canvasBg.width = innerWidth
canvasBg.height = innerHeight
const contextBg = canvasBg.getContext('2d')
const game = new Game(
    new Player(
        new Point(canvasBg.width / 2, canvasBg.height / 2),
        0,
        0,
        15,
        'blue'
    ),
    contextBg
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
    contextBg.clearRect(0, 0, canvasBg.width, canvasBg.height)
    // contextFg.clearRect(0, 0, canvasFg.width, canvasFg.height)
    game.update()
    game.draw(contextBg)
    requestAnimationFrame(gameLoop)
}
