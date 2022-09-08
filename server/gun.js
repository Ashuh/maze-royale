const { Projectile } = require('./projectile.js')

class Gun {
    constructor() {
        this.coolDown = 0
    }

    static getShotInterval() {
        return 60 / 500 // 500 rpm
    }

    update(dt) {
        this.coolDown -= dt
    }

    isReady() {
        return this.coolDown <= 0
    }

    fire(player) {
        if (!this.isReady()) {
            return
        }
        this.coolDown = Gun.getShotInterval()
        return new Projectile(
            player,
            player.gunHeading,
            3000,
            player.color
        )
    }
}

module.exports = {
    Gun
}
