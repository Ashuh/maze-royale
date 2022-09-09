const { Game } = require('./game.js')
const { Server } = require('socket.io')

const io = new Server({
    cors: {
        origin: 'http://127.0.0.1:5500'
    }
})

const playerIdToGame = {}
const gameIdToGame = {}

io.on('connection', (socket) => {
    let game = null

    socket.on('newGame', () => {
        socket.join(socket.id)
        game = new Game(socket.id)
        gameIdToGame[socket.id] = game
        playerIdToGame[socket.id] = game
        game.spawnNewPlayer(socket.id)
        socket.emit('initGame', socket.id)
        io.to(game.id).emit('playerJoined', Object.values(game.players))
        console.log(socket.id + ' created new game ' + game.id)
    })

    socket.on('joinGame', (id) => {
        if (!io.sockets.adapter.rooms.get(id)) {
            socket.emit('invalidGameCode')
            return
        }
        socket.join(id)
        game = playerIdToGame[id]
        playerIdToGame[socket.id] = game
        game.spawnNewPlayer(socket.id)
        socket.emit('initGame', socket.id)
        io.to(game.id).emit('playerJoined', Object.values(game.players))
        console.log(socket.id + ' joined game ' + id)
    })

    socket.on('startGame', () => {
        if (game == null || socket.id !== game.id) {
            return
        }
        io.to(game.id).emit('startGame', game.maze)
        game.isStarted = true
        gameLoop(game)
    })

    let keyW = false
    let keyA = false
    let keyS = false
    let keyD = false

    socket.on('camera', (x, y) => {
        if (game == null) {
            return
        }
        game.setCameraPosition(socket.id, x, y)
    })

    // socket.on('click', () => {
    //     if (game == null) {
    //         return
    //     }
    //     game.mouseClick(socket.id)
    // })

    socket.on('mouseMove', (x, y) => {
        if (game == null) {
            return
        }
        game.setMousePosition(socket.id, x, y)
    })

    socket.on('mouseUp', (button) => {
        if (game == null) {
            return
        }

        switch (button) {
        case 0: // left mouse button
            game.setIsFiring(socket.id, false)
            break
        case 1: // middle mouse button
            break
        case 2: // right mouse button
            game.setIsAiming(socket.id, false)
            break
        default:
            break
        }
    })

    socket.on('mouseDown', (button) => {
        if (game == null) {
            return
        }

        switch (button) {
        case 0: // left mouse button
            game.setIsFiring(socket.id, true)
            break
        case 1: // middle mouse button
            break
        case 2: // right mouse button
            game.setIsAiming(socket.id, true)
            break
        default:
            break
        }
    })

    socket.on('keyUp', (key) => {
        if (game == null) {
            return
        }
        switch (key) {
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

        game.setDirectionalKeys(socket.id, keyW, keyA, keyS, keyD)
    })

    socket.on('keyDown', (key) => {
        if (game == null) {
            return
        }
        switch (key) {
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

        game.setDirectionalKeys(socket.id, keyW, keyA, keyS, keyD)
    })

    socket.on('disconnect', () => {
        if (game == null) {
            return
        }
        console.log('disconnect')
        if (game.isStarted) {
            game.KillPlayer(socket.id, socket.id)
        } else {
            game.deletePlayer(socket.id)
        }
        delete playerIdToGame[socket.id]
        io.to(game.id).emit('playerLeft', Object.values(game.players))
    })

    function gameLoop(game) {
        let secondsPassed = 0
        let oldTimeStamp = 0
        let fps = 0

        const intervalId = setInterval(() => {
            if (!io.sockets.adapter.rooms.get(game.id)) {
                clearInterval(intervalId)
                delete gameIdToGame[game.id]
                console.log('game killed')
                return
            }

            secondsPassed = (Date.now() - oldTimeStamp) / 1000
            oldTimeStamp = Date.now()
            game.update(secondsPassed)
            const state = game.getState()
            io.to(game.id).emit('state', state)
            fps = Math.round(1 / secondsPassed)
        }, 1000 / 150)
    }
})

io.listen(3000)
