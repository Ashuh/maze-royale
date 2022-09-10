class Lobby {
    constructor(host) {
        this.idToUser = {}
        this.idToUser[host.id] = host
        this.hostId = host.id
        this.id = host.id
    }

    isReady() {
        for (const user of this.getUsers()) {
            if (!user.isHost && !user.isReady) {
                return false
            }
        }
        return true
    }

    getUsers() {
        return Object.values(this.idToUser)
    }

    getUserById(id) {
        return this.idToUser[id]
    }

    addUser(user) {
        this.idToUser[user.id] = user
    }

    removeUser(id) {
        delete this.idToUser[id]
    }

    getState() {
        const state = {}
        state.hostId = this.hostId
        state.users = this.getUsers()
        state.numUsers = state.users.length
        return state
    }
}

module.exports = {
    Lobby
}
