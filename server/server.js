const { Game } = require('./game.js')
const { Lobby } = require('./lobby.js')
const { Server } = require('socket.io')
const { User } = require('./user.js')

const io = new Server({
    cors: {
        origin: 'http://127.0.0.1:5500'
    }
})

const userIdToLobby = {}
const lobbyIdToLobby = {}

const playerIdToGame = {}
const gameIdToGame = {}

io.on('connection', (socket) => {
    socket.on('newGame', (name) => {
        socket.join(socket.id)
        const user = new User(socket.id, name, true)
        const lobby = new Lobby(user)
        userIdToLobby[socket.id] = lobby
        lobbyIdToLobby[socket.id] = lobby

        socket.emit('initGame', socket.id)
        io.to(lobby.id).emit('lobbyState', lobby.getState())
        console.log(socket.id + ' created new game ' + lobby.id)
    })

    socket.on('joinGame', (name, lobbyId) => {
        if (!io.sockets.adapter.rooms.get(lobbyId)) {
            socket.emit('error', lobbyId + ' is not a valid code')
            return
        }

        socket.join(lobbyId)
        const user = new User(socket.id, name, false)
        const lobby = lobbyIdToLobby[lobbyId]
        lobby.addUser(user)
        userIdToLobby[socket.id] = lobby

        socket.emit('initGame', socket.id)
        io.to(lobby.id).emit('lobbyState', lobby.getState())
        console.log(socket.id + ' joined game ' + lobbyId)
    })

    socket.on('ready', () => {
        const lobby = userIdToLobby[socket.id]
        lobby.getUserById(socket.id).toggleIsReady()
        io.to(lobby.id).emit('lobbyState', lobby.getState())
    })

    socket.on('startGame', () => {
        const lobby = userIdToLobby[socket.id]
        if (lobby.hostId !== socket.id) {
            return
        }

        if (lobby.getUsers().length < 2) {
            socket.emit('error', 'Not enough players to start game')
            return
        }

        if (!lobby.isReady()) {
            socket.emit('error', 'Not all players are ready')
            return
        }

        const game = new Game(socket.id)
        gameIdToGame[lobby.id] = game
        lobby.getUsers().forEach((user) => {
            game.spawnNewPlayer(user.id)
            playerIdToGame[user.id] = game
            delete userIdToLobby[user.id]
        })
        delete lobbyIdToLobby[socket.id]

        io.to(game.id).emit('startGame', game.maze)
        game.isStarted = true
        gameLoop(game)
    })

    socket.on('camera', (x, y) => {
        const game = playerIdToGame[socket.id]
        if (game == null) {
            return
        }
        game.setCameraPosition(socket.id, x, y)
    })

    socket.on('mouseMove', (x, y) => {
        const game = playerIdToGame[socket.id]

        if (game == null) {
            return
        }
        game.setMousePosition(socket.id, x, y)
    })

    socket.on('mouseUp', (button) => {
        const game = playerIdToGame[socket.id]

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
        const game = playerIdToGame[socket.id]

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

    let keyW = false
    let keyA = false
    let keyS = false
    let keyD = false

    socket.on('keyUp', (key) => {
        const game = playerIdToGame[socket.id]

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
        const game = playerIdToGame[socket.id]

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
        const lobby = userIdToLobby[socket.id]
        const game = playerIdToGame[socket.id]

        if (lobby != null) {
            lobby.removeUser(socket.id)
            delete userIdToLobby[socket.id]
            io.to(lobby.id).emit('lobbyState', lobby.getState())
            if (lobby.getUsers().length === 0) {
                delete lobbyIdToLobby[lobby.id]
            }
        } else if (game != null) {
            game.killPlayer(socket.id, socket.id)
            delete playerIdToGame[socket.id]
        }
        console.log('disconnect')
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
