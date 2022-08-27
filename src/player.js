export class Player {
    constructor(x, y, movementHeading, gunHeading, radius, color) {
        this.x = x
        this.y = y
        this.movementHeading = movementHeading
        this.gunHeading = gunHeading
        this.radius = radius
        this.color = color
        this.maxSpeed = 3
        this.isMoving = false
    }

    setIsMoving(isMoving) {
        this.isMoving = isMoving
    }

    setGunHeading(gunHeading) {
        this.gunHeading = gunHeading
    }

    setMovementHeading(movementHeading) {
        this.movementHeading = movementHeading
    }

    move() {
        if (!this.isMoving) {
            return
        }

        const xVel = this.maxSpeed * Math.sin(this.movementHeading)
        const yVel = this.maxSpeed * Math.cos(this.movementHeading)
        this.x += xVel
        this.y += yVel
    }

    draw(context) {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()

        context.beginPath()
        context.moveTo(this.x, this.y)
        const endX = this.x + Math.sin(this.gunHeading) * 100
        const endY = this.y + Math.cos(this.gunHeading) * 100
        context.lineTo(endX, endY)
        context.strokeStyle = 'white'
        context.stroke()
    }
}
