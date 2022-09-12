const { User } = require('./user')
const { Lobby } = require('./lobby')
const { Game } = require('./game')

class Room {
    static usedIds = new Set()

    #server
    #id
    #lobby
    #game
    #isGameStarted = false
    #onDestroyListener

    constructor(server, onDestroyListener) {
        this.#server = server
        this.#onDestroyListener = onDestroyListener
        this.#id = Room.#generateRandomId()
        Room.usedIds.add(this.#id)
        this.fps = 0
    }

    addSocket(socket, name) {
        if (this.#isGameStarted) {
            return
        }
        socket.join(this.#id)

        if (this.#lobby == null) {
            const user = new User(socket.id, name, true)
            this.#lobby = new Lobby(user)
        } else {
            const user = new User(socket.id, name, false)
            this.#lobby.addUser(user)
        }
        socket.emit('joinLobby', this.#id)
        this.#server.to(this.#id).emit('lobbyState', this.#lobby.getState())
        console.log(socket.id + ' created new game ' + this.#id)

        socket.on('ready', () => {
            if (this.#isGameStarted) {
                return
            }
            this.#lobby.getUserById(socket.id).toggleIsReady()
            this.#server.to(this.#id).emit('lobbyState', this.#lobby.getState())
        })

        socket.on('startGame', () => {
            if (this.#isGameStarted) {
                return
            }

            if (this.#lobby.hostId !== socket.id) {
                return
            }

            if (this.#lobby.getUsers().length < 2) {
                socket.emit('error', 'Not enough players to start game.')
                return
            }

            if (!this.#lobby.isReady()) {
                socket.emit('error', 'Not all players are ready.')
                return
            }

            this.#game = new Game(socket.id, (playerId, results) => {
                const socket = this.#server.sockets.sockets.get(playerId)
                if (socket == null) {
                    return
                }
                socket.emit('playerDeath', results)
            })

            this.#lobby.getUsers().forEach((user) => {
                this.#game.spawnNewPlayer(user)
            })

            this.#server.to(this.#id).emit('startGame', this.#game.maze)
            this.#isGameStarted = true
            this.gameLoop()
        })

        socket.on('camera', (x, y) => {
            if (this.#game == null) {
                return
            }
            this.#game.setCameraPosition(socket.id, x, y)
        })

        socket.on('mouseMove', (x, y) => {
            if (this.#game == null) {
                return
            }
            this.#game.setMousePosition(socket.id, x, y)
        })

        socket.on('mouseUp', (button) => {
            if (this.#game == null) {
                return
            }

            switch (button) {
            case 0: // left mouse button
                this.#game.setIsFiring(socket.id, false)
                break
            case 1: // middle mouse button
                break
            case 2: // right mouse button
                this.#game.setIsAiming(socket.id, false)
                break
            default:
                break
            }
        })

        socket.on('mouseDown', (button) => {
            if (this.#game == null) {
                return
            }

            switch (button) {
            case 0: // left mouse button
                this.#game.setIsFiring(socket.id, true)
                break
            case 1: // middle mouse button
                break
            case 2: // right mouse button
                this.#game.setIsAiming(socket.id, true)
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
            if (this.#game == null) {
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

            this.#game.setDirectionalKeys(socket.id, keyW, keyA, keyS, keyD)
        })

        socket.on('keyDown', (key) => {
            if (this.#game == null) {
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

            this.#game.setDirectionalKeys(socket.id, keyW, keyA, keyS, keyD)
        })

        socket.on('disconnect', () => {
            if (this.#isGameStarted && this.#game == null) {
                // Game ended
                return
            }

            if (this.#isGameStarted) {
                // Game in progress
                this.#game.forceKillPlayer(socket.id)
            } else {
                // Waiting for game to start
                this.#lobby.removeUser(socket.id)
                this.#server
                    .to(this.#id)
                    .emit('lobbyState', this.#lobby.getState())
                if (this.#lobby.getUsers().length === 0) {
                    this.#destroy()
                }
            }
        })
    }

    gameLoop() {
        let secondsPassed = 0
        let oldTimeStamp = 0
        // let fps = 0

        const intervalId = setInterval(() => {
            secondsPassed = (Date.now() - oldTimeStamp) / 1000
            oldTimeStamp = Date.now()
            const isGameOver = this.#game.update(secondsPassed)
            this.#server.to(this.#id).emit('gameUpdate', this.#game.getState())
            this.fps = Math.round(1 / secondsPassed)

            if (isGameOver) {
                clearInterval(intervalId)
                this.#server
                    .to(this.#id)
                    .emit('gameOver', this.#game.getResults())
                this.#destroy()
            }
        }, 1000 / 100)
    }

    #destroy() {
        console.log('destroying room ' + this.#id)
        this.#onDestroyListener()
        this.#lobby = null
        this.#game = null
        this.#id = null
        Room.usedIds.delete(this.#id)
    }

    static #generateRandomId() {
        let id = ''

        do {
            for (let i = 0; i < 4; i++) {
                const char = String.fromCharCode(
                    Math.floor(Math.random() * 26) + 65
                )
                id += char
            }
        } while (Room.usedIds.has(id))

        return id
    }

    getId() {
        return this.#id
    }
}

module.exports = {
    Room
}
