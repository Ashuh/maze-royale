const { Server } = require('socket.io')
const { Room } = require('./room')

const io = new Server({
    cors: {
        origin: 'http://127.0.0.1:5500'
    }
})

const idToRoom = {}

io.on('connection', (socket) => {
    console.log(socket.id + ' connected')

    socket.on('newGame', (name) => {
        const room = new Room(io, () => {
            delete idToRoom[room.getId()]
        })
        room.addSocket(socket, name)
        idToRoom[room.getId()] = room
    })

    socket.on('joinGame', (name, roomId) => {
        const room = idToRoom[roomId]
        if (room == null) {
            socket.emit('error', 'You have entered an invalid code')
            return
        }
        room.addSocket(socket, name)
    })
})

setInterval(() => {
    console.log('_________________')
    console.log('rooms')
    console.log(Object.keys(idToRoom))
}, 3000)

io.listen(3000)
