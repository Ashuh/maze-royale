class User {
    constructor(id, name, isHost) {
        this.id = id
        this.name = name.length === 0 ? 'Anon' : name
        this.isHost = isHost
        this.isReady = false
    }

    toggleIsReady() {
        this.isReady = !this.isReady
    }
}

module.exports = {
    User
}
