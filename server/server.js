const { Server } = require('socket.io')
const { Room } = require('./room')

const io = new Server({
    cors: {
        origin: ['http://127.0.0.1:5500', 'https://maze-royale.netlify.app']
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
    Object.keys(idToRoom).forEach((id) => {
        console.log(id, idToRoom[id].fps)
    })
}, 3000)

io.listen(process.env.PORT || 3000)
