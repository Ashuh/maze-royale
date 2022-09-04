class Projectile {
    constructor(position, heading, velocity, color) {
        this.position = position
        this.heading = heading
        this.radius = 10
        this.velocity = velocity
        this.color = color
        this.distTraveled = 0
    }

    move(dt) {
        const xVel = this.velocity * Math.sin(this.heading) * dt
        const yVel = this.velocity * Math.cos(this.heading) * dt
        this.position.x += xVel
        this.position.y += yVel
        this.distTraveled += this.velocity * dt
    }

    draw(context) {
        context.beginPath()
        context.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        )
        context.fillStyle = this.color
        context.fill()
    }
}

module.exports = {
    Projectile
}
