const { Vector } = require('./vector.js')

class Projectile {
    constructor(player, heading, velocity, color) {
        const offset = new Vector(
            Math.cos(player.gunHeading),
            Math.sin(player.gunHeading)
        ).scalarProduct(player.radius)

        this.player = player
        this.position = player.position.add(offset)
        this.trail = [this.position.copy(), this.position.copy()] // newest to oldest position
        this.heading = heading
        this.velocity = velocity
        this.color = color
        this.distTraveled = 0
        this.playerImmunity = 2
    }

    getPrevPosition() {
        return this.trail[0]
    }

    static getMaxRange() {
        return 2000
    }

    move(dt) {
        if (this.playerImmunity > 0) {
            this.playerImmunity--
        }
        this.trail.pop()
        this.trail.unshift(this.position.copy())
        const xVel = this.velocity * Math.cos(this.heading) * dt
        const yVel = this.velocity * Math.sin(this.heading) * dt
        this.position.x += xVel
        this.position.y += yVel
        this.distTraveled += this.velocity * dt
    }
}

module.exports = {
    Projectile
}
