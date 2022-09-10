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

const initialScreen = document.getElementById('initialScreen')
const lobbyScreen = document.getElementById('lobbyScreen')
const gameScreen = document.getElementById('gameScreen')
const newGameButton = document.getElementById('newGameButton')
const joinGameButton = document.getElementById('joinGameButton')
const startGameButton = document.getElementById('startGameButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const playerNameInput = document.getElementById('playerNameInput')
const playerList = document.getElementById('playerList')

const socket = io('http://localhost:3000')

newGameButton.addEventListener('click', () => {
    socket.emit('newGame', playerNameInput.value)
    startGameButton.innerText = 'Start Game'
    startGameButton.addEventListener('click', () => {
        socket.emit('startGame')
    })
})

joinGameButton.addEventListener('click', () => {
    socket.emit('joinGame', playerNameInput.value, gameCodeInput.value)
    startGameButton.innerText = 'Ready'
    startGameButton.addEventListener('click', () => {
        socket.emit('ready')
    })
})

class ClientState {
    static INITIAL = new ClientState('initial')
    static LOBBY = new ClientState('lobby')
    static GAME_ALIVE = new ClientState('alive')
    static GAME_SPECTATOR = new ClientState('spectator')
    static GAME_END = new ClientState('game end')

    constructor(name) {
        this.name = name
    }
}

let clientState = ClientState.INITIAL
let maze = null
let camera = null

let spectatingId = null

let secondsPassed
let oldTimeStamp
let fps

socket.on('joinLobby', (code) => {
    clientState = ClientState.LOBBY
    initialScreen.style.display = 'none'
    lobbyScreen.style.display = 'block'
    document.getElementById('gameCode').innerText = code
})

socket.on('lobbyState', (state) => {
    document.getElementById('numPlayers').innerText =
        state.numUsers + ' player(s) in lobby'

    playerList.innerHTML =
        '<ol>' +
        state.users.map((user) => userToString(user)).join('') +
        '</ol>'

    function userToString(user) {
        let marker
        if (user.isHost) {
            marker = '⭐'
        } else {
            marker = user.isReady ? '🟢' : '🔴'
        }
        return `<li>${user.name} ${marker}</li>`
    }
})

socket.on('startGame', (inMaze) => {
    clientState = ClientState.GAME_ALIVE
    lobbyScreen.style.display = 'none'
    gameScreen.style.display = 'block'
    spectatingId = socket.id
    maze = inMaze
    camera = new Camera(
        contextBg.canvas.width,
        contextBg.canvas.height,
        inMaze.width,
        inMaze.height
    )
    setInterval(() => {
        camera.update()
        socket.emit('camera', camera.x, camera.y)
    }, 1000 / 60)
})

socket.on('error', (msg) => {
    alert(msg)
})

socket.on('state', (state) => {
    drawState(state)
    const timeStamp = Date.now()
    secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp

    fps = Math.round(1 / secondsPassed)
    // console.log(fps)
})

addEventListener('contextmenu', (event) => {
    event.preventDefault()
})

addEventListener('mousemove', (event) => {
    if (
        clientState === ClientState.GAME_SPECTATOR ||
        clientState === ClientState.GAME_ALIVE
    ) {
        camera.setMousePosition(event.clientX, event.clientY)
    }
    if (clientState === ClientState.GAME_ALIVE) {
        socket.emit('mouseMove', event.clientX, event.clientY)
    }
})

addEventListener('mouseup', (event) => {
    if (clientState !== ClientState.GAME_ALIVE) {
        return
    }
    socket.emit('mouseUp', event.button)
    if (event.button === 2) {
        camera.isZoomed = false
    }
})

addEventListener('mousedown', (event) => {
    if (clientState !== ClientState.GAME_ALIVE) {
        return
    }
    socket.emit('mouseDown', event.button)
    if (event.button === 2) {
        camera.isZoomed = true
    }
})

addEventListener('keyup', (event) => {
    if (clientState !== ClientState.GAME_ALIVE) {
        return
    }
    socket.emit('keyUp', event.key)
})

addEventListener('keydown', (event) => {
    if (clientState !== ClientState.GAME_ALIVE) {
        return
    }
    socket.emit('keyDown', event.key)
})

function drawState(state) {
    if (clientState === ClientState.GAME_ALIVE) {
        const player = state.players[socket.id]

        if (!player.isAlive) {
            clientState = ClientState.GAME_SPECTATOR
            spectatingId = player.killedBy
        }
    } else if (clientState === ClientState.GAME_SPECTATOR) {
        const player = state.players[spectatingId]

        if (!player.isAlive) {
            spectatingId = player.killedBy
        }
    }

    const playerSpectating = state.players[spectatingId]
    const playerPos = playerSpectating.position
    camera.setPlayerPosition(playerPos.x, playerPos.y)
    camera.transformContext(contextBg)
    camera.transformContext(contextFow)
    camera.transformContext(contextFg)

    clearContext(contextBg)
    clearContext(contextFg)

    if (clientState === ClientState.GAME_SPECTATOR) {
        contextFg.fillStyle = 'red'
        contextFg.font = '24px arial'
        contextFg.textAlign = 'center'
        contextFg.fillText(
            'Spectating ' + playerSpectating.name,
            camera.x + contextFg.canvas.width / 2,
            camera.y + contextFg.canvas.height / 4
        )
    }

    drawMaze(maze)
    Object.keys(state.players).forEach((id) => {
        if (state.players[id].isAlive) {
            drawPlayer(state.players[id])
        }
    })
    state.projectiles.forEach((projectile) => {
        drawProjectile(projectile)
    })
    drawVisibilityPolygon(playerSpectating.visibilityPolygon)
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
    const context = player.id === spectatingId ? contextFg : contextBg
    drawCircle(
        context,
        player.position.x,
        player.position.y,
        player.radius,
        player.color
    )

    const startX = player.position.x
    const startY = player.position.y
    const endX = player.position.x + Math.cos(player.gunHeading) * 100
    const endY = player.position.y + Math.sin(player.gunHeading) * 100
    drawLine(context, startX, startY, endX, endY, 'black')

    context.font = '20px bold arial'
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.fillText(
        player.name,
        player.position.x,
        player.position.y - 2 * player.radius
    )
}

function drawProjectile(projectile) {
    const startX = projectile.position.x
    const startY = projectile.position.y
    const endX = projectile.trail[projectile.trail.length - 1].x
    const endY = projectile.trail[projectile.trail.length - 1].y
    const grd = contextBg.createLinearGradient(startX, startY, endX, endY)
    grd.addColorStop(0, projectile.color)
    grd.addColorStop(1, 'white')

    contextBg.beginPath()
    contextBg.moveTo(startX, startY)
    contextBg.lineTo(endX, endY)
    contextBg.strokeStyle = grd
    contextBg.stroke()
}

function drawMaze(maze) {
    contextBg.fillStyle = maze.cellColor

    for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols; c++) {
            const cell = maze.cells[r][c]
            const beginX = cell.col * maze.cellSize
            const beginY = cell.row * maze.cellSize
            contextBg.fillRect(beginX, beginY, maze.cellSize, maze.cellSize)
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

function drawVisibilityPolygon(polygonPoints) {
    if (polygonPoints == null) {
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
    contextFow.moveTo(polygonPoints[0].x, polygonPoints[0].y)
    polygonPoints.forEach((point) => contextFow.lineTo(point.x, point.y))
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

function drawLine(context, startX, startY, endX, endY, color, width = 1) {
    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.strokeStyle = color
    context.lineWidth = width
    context.stroke()
}
