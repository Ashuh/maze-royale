export class Projectile {
    constructor(x, y, heading, velocity, color) {
        this.x = x
        this.y = y
        this.heading = heading
        this.radius = 10
        this.velocity = velocity
        this.color = color
        this.distTraveled = 0
    }

    move() {
        const xVel = this.velocity * Math.sin(this.heading)
        const yVel = this.velocity * Math.cos(this.heading)
        this.x += xVel
        this.y += yVel
        this.distTraveled += this.velocity
    }

    draw(context) {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = this.color
        context.fill()
    }
}
