const { Projectile } = require('./projectile.js')

class Gun {
    constructor() {
        this.coolDown = 0
    }

    static getShotInterval() {
        return 60 / 500 // 500 rpm
    }

    static getShotSpread() {
        return 2 * (Math.PI / 180)
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
            player.gunHeading + 2 * (Math.random() - 0.5) * Gun.getShotSpread(),
            3000,
            player.color
        )
    }
}

module.exports = {
    Gun
}
