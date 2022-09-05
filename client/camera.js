export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.x = 0
        this.y = 0
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight
    }

    update(playerPos, mouseX, mouseY) {
        // TODO: Only works when world is larger than canvas!!
        // Convert mouse position in canvas frame to world frame
        mouseX += this.x
        mouseY += this.y
        const targetX = playerPos.x + (mouseX - playerPos.x) / 3
        const targetY = playerPos.y + (mouseY - playerPos.y) / 3
        this.x = this.clamp(
            targetX - this.canvasWidth / 2,
            0,
            this.worldWidth - this.canvasWidth
        )
        this.y = this.clamp(
            targetY - this.canvasHeight / 2,
            0,
            this.worldHeight - this.canvasHeight
        )
    }

    transformContext(context) {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.translate(-this.x, -this.y)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
}
