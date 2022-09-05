const { Circle } = require('./circle.js')

class Projectile extends Circle {
    constructor(position, heading, velocity, color) {
        super(position, Projectile.getRadius())
        this.position = position
        this.heading = heading
        this.velocity = velocity
        this.color = color
        this.distTraveled = 0
    }

    static getRadius() {
        return 5
    }

    static getMaxRange() {
        return 2000
    }

    move(dt) {
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
