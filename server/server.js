const { Game } = require('./game.js')
const { Server } = require('socket.io')

const io = new Server({
    cors: {
        origin: 'http://127.0.0.1:5500'
    }
})

let secondsPassed = 0
let oldTimeStamp = 0
let fps = 0

let game = null

io.on('connection', (socket) => {
    socket.on('joinGame', () => {
        if (game == null) {
            game = new Game(socket.id)
            gameLoop()
        }
        game.spawnNewPlayer(socket.id)
        socket.join(game.id)
        console.log(socket.id + ' connected to ' + game.id)
        socket.emit('maze', game.maze)
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
        game.killPlayer(socket.id, 'server')
    })

    function gameLoop() {
        const intervalId = setInterval(() => {
            if (!io.sockets.adapter.rooms.get(game.id)) {
                clearInterval(intervalId)
                game = null
                return
            }

            secondsPassed = (Date.now() - oldTimeStamp) / 1000
            game.update(secondsPassed)
            const state = game.getState()
            io.to(game.id).emit('state', state)
            fps = Math.round(1 / secondsPassed)
            oldTimeStamp = Date.now()
            console.log(fps)
        }, 1000 / 150)
    }
})

io.listen(3000)
