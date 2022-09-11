import { Camera } from './camera.js'
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'
import { Modal } from 'bootstrap'

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
const readyButton = document.getElementById('readyButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const playerNameInput = document.getElementById('playerNameInput')
const playerList = document.getElementById('playerList')
const leaveGameButton = document.getElementById('leaveGameButton')
const resultsModal = new Modal(document.getElementById('resultsModal'), {
    backdrop: 'static',
    keyboard: false
})

const socket = io('http://localhost:3000')

newGameButton.addEventListener('click', () => {
    socket.emit('newGame', playerNameInput.value)
    startGameButton.style.display = 'block'
    readyButton.style.display = 'none'
})

joinGameButton.addEventListener('click', () => {
    socket.emit('joinGame', playerNameInput.value, gameCodeInput.value)
    startGameButton.style.display = 'none'
    readyButton.style.display = 'block'
})

startGameButton.addEventListener('click', () => {
    socket.emit('startGame')
})

readyButton.addEventListener('click', () => {
    socket.emit('ready')
})

leaveGameButton.addEventListener('click', () => {
    clientState = ClientState.INITIAL
    initialScreen.style.display = 'block'
    gameScreen.style.display = 'none'
    socket.disconnect()
    socket.connect('http://localhost:3000')
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

// let secondsPassed
// let oldTimeStamp
// let fps

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

socket.on('gameUpdate', (gameState) => {
    if (clientState === ClientState.GAME_SPECTATOR) {
        const player = gameState.players[spectatingId]

        if (player.health <= 0) {
            spectatingId = player.killedBy
        }
    }

    drawGameState(gameState)
    // const timeStamp = Date.now()
    // secondsPassed = (timeStamp - oldTimeStamp) / 1000
    // oldTimeStamp = timeStamp
    // fps = Math.round(1 / secondsPassed)
    // console.log(fps)
})

socket.on('playerDeath', (results) => {
    clientState = ClientState.GAME_SPECTATOR
    const killer = results.playerIdToKiller[socket.id]
    const killerName = killer.name
    const rank = results.playerIdToRanking[socket.id]
    const numPlayers = results.numPlayers
    spectatingId = killer.id
    showLoseResultsModal(killerName, rank, numPlayers, false)
})

socket.on('gameOver', (results) => {
    const rank = results.playerIdToRanking[socket.id]
    const isWinner = rank === 1
    if (isWinner) {
        const numPlayers = results.numPlayers
        showWinResultsModal(numPlayers)
    } else {
        const killer = results.playerIdToKiller[socket.id]
        const killerName = killer.name
        const rank = results.playerIdToRanking[socket.id]
        const numPlayers = results.numPlayers
        showLoseResultsModal(killerName, rank, numPlayers, true)
    }

    clientState = ClientState.GAME_END
})

socket.on('error', (msg) => {
    document.getElementById('errorBody').innerText = msg
    const myModal = new Modal(document.getElementById('errorModal'), {})
    myModal.show()
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

/**
 * Draws the game from the perspective of the player being spectated
 */
function drawGameState(state) {
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
    Object.values(state.players)
        .filter((player) => player.health > 0)
        .forEach((player) => {
            drawPlayer(player)
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

function showLoseResultsModal(killerName, rank, totalNumPlayers, isGameOver) {
    document.getElementById('resultsModalTitle').innerText =
        'BETTER LUCK NEXT TIME!'
    document.getElementById('resultsBody').innerHTML =
        `<p>Killed by ${killerName}</p>` +
        `<p>Rank #${rank} / ${totalNumPlayers}</p>`
    document.getElementById('spectateButton').style.display = isGameOver
        ? 'none'
        : 'block'
    resultsModal.show()
}

function showWinResultsModal(totalNumPlayers) {
    document.getElementById('resultsModalTitle').innerText =
        'WINNER WINNER CHICKEN DINNER!'
    document.getElementById(
        'resultsBody'
    ).innerHTML = `<p>Rank #1 / ${totalNumPlayers}</p>`
    document.getElementById('spectateButton').style.display = 'none'
    resultsModal.show()
}
