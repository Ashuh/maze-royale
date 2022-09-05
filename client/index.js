import { Camera } from './camera.js'
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const canvasBg = document.getElementById('canvas_bg')
canvasBg.width = innerWidth
canvasBg.height = innerHeight
const contextBg = canvasBg.getContext('2d')

const canvasFow = document.getElementById('canvas_fow')
canvasFow.width = innerWidth
canvasFow.height = innerHeight
const contextFow = canvasFow.getContext('2d')

const canvasFg = document.getElementById('canvas_fg')
canvasFg.width = innerWidth
canvasFg.height = innerHeight
const contextFg = canvasFg.getContext('2d')

// const canvasDebug = document.getElementById('canvas_debug')
// canvasDebug.width = innerWidth
// canvasDebug.height = innerHeight
// const contextDebug = canvasDebug.getContext('2d')

let maze = null
let camera = null
let mouseX = 0
let mouseY = 0

const socket = io('http://localhost:3000')
socket.emit('joinGame')

let secondsPassed
let oldTimeStamp
let fps

addEventListener('click', (event) => {
    socket.emit('click')
})

addEventListener('mousemove', (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
    socket.emit('mouseMove', event.clientX, event.clientY)
})

addEventListener('keydown', (event) => {
    socket.emit('keyDown', event.key)
})

addEventListener('keyup', (event) => {
    socket.emit('keyUp', event.key)
})

socket.on('maze', (inMaze) => {
    maze = inMaze
    const mazeWidth = maze.cellSize * maze.cols
    const mazeHeight = maze.cellSize * maze.rows
    camera = new Camera(
        contextBg.canvas.width,
        contextBg.canvas.height,
        mazeWidth,
        mazeHeight
    )
})

socket.on('state', (state) => {
    console.log('state received')
    drawState(state)
    const timeStamp = Date.now()
    secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp

    fps = Math.round(1 / secondsPassed)
    console.log(fps)
})

function drawState(state) {
    camera.update(state.players[socket.id].position, mouseX, mouseY)
    socket.emit('camera', camera.x, camera.y)
    camera.transformContext(contextBg)
    camera.transformContext(contextFow)
    camera.transformContext(contextFg)

    clearContext(contextBg)
    clearContext(contextFg)

    state.projectiles.forEach((projectile) => {
        drawProjectile(projectile)
    })

    drawMaze(maze)
    Object.keys(state.players).forEach((id) => {
        drawPlayer(state.players[id])
    })
    drawVisibilityPolygon(state.players[socket.id].visibilityPolygon)
}

function clearContext(context) {
    context.clearRect(
        camera.x,
        camera.y,
        context.canvas.width,
        context.canvas.height
    )
}

function drawPlayer(player) {
    drawCircle(
        contextBg,
        player.position.x,
        player.position.y,
        player.radius,
        player.color
    )

    const startX = player.position.x
    const startY = player.position.y
    const endX = player.position.x + Math.sin(player.gunHeading) * 100
    const endY = player.position.y + Math.cos(player.gunHeading) * 100
    drawLine(contextBg, startX, startY, endX, endY)
}

function drawProjectile(projectile) {
    drawCircle(
        contextBg,
        projectile.position.x,
        projectile.position.y,
        projectile.radius,
        projectile.color
    )
}

function drawMaze(maze) {
    contextFg.fillStyle = maze.cellColor

    for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols; c++) {
            const cell = maze.cells[r][c]
            const beginX = cell.col * maze.cellSize
            const beginY = cell.row * maze.cellSize
            contextFg.fillRect(beginX, beginY, maze.cellSize, maze.cellSize)
        }
    }

    contextFg.strokeStyle = maze.WallColor

    for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols + 1; c++) {
            const wall = maze.verticalWalls[r][c]
            if (wall.isOpen) {
                continue
            }
            const x = wall.col * wall.length
            const beginY = wall.row * wall.length
            const endY = beginY + wall.length
            drawLine(contextFg, x, beginY, x, endY)
        }
    }

    for (let r = 0; r < maze.rows + 1; r++) {
        for (let c = 0; c < maze.cols; c++) {
            const wall = maze.horizontalWalls[r][c]
            if (wall.isOpen) {
                continue
            }
            const y = wall.row * wall.length
            const beginX = wall.col * wall.length
            const endX = beginX + wall.length
            drawLine(contextFg, beginX, y, endX, y)
        }
    }
}

function drawVisibilityPolygon(polygon) {
    if (polygon == null) {
        return
    }

    contextFow.fillStyle = 'rgba(0, 0, 0, 1)'
    contextFow.fillRect(
        camera.x,
        camera.y,
        contextFow.canvas.width,
        contextFow.canvas.height
    )

    contextFow.globalCompositeOperation = 'destination-out'
    contextFow.beginPath()
    contextFow.moveTo(polygon.points[0].x, polygon.points[0].y)
    polygon.points.forEach((point) => contextFow.lineTo(point.x, point.y))
    contextFow.closePath()
    contextFow.fill()
    contextFow.globalCompositeOperation = 'source-over'
}

function drawCircle(context, x, y, radius, color) {
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2, false)
    context.fillStyle = color
    context.fill()
}

function drawLine(context, startX, startY, endX, endY, color) {
    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.strokeStyle = color
    context.stroke()
}
