export class Player {
    constructor(position, movementHeading, gunHeading, radius, color) {
        this.position = position
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

    lookAtPoint(point) {
        const heading = this.position.angleTo(point)
        this.gunHeading = heading
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
        this.position.x += xVel
        this.position.y += yVel
    }

    draw(context) {
        context.beginPath()
        context.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false
        )
        context.fillStyle = this.color
        context.fill()

        context.beginPath()
        context.moveTo(this.position.x, this.position.y)
        const endX = this.position.x + Math.sin(this.gunHeading) * 100
        const endY = this.position.y + Math.cos(this.gunHeading) * 100
        context.lineTo(endX, endY)
        context.strokeStyle = 'red'
        context.stroke()
    }
}
