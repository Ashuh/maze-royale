export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.x = 0
        this.y = 0
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.minX = Math.min(0, (worldWidth - canvasWidth) / 2)
        this.minY = Math.min(0, (worldHeight - canvasHeight) / 2)
        this.maxX = Math.max(
            worldWidth - canvasWidth,
            (worldWidth - canvasWidth) / 2
        )
        this.maxY = Math.max(
            worldHeight - canvasHeight,
            (worldHeight - canvasHeight) / 2
        )
    }

    update(playerPos, mouseX, mouseY) {
        // Convert mouse position in canvas frame to world frame
        mouseX += this.x
        mouseY += this.y
        const targetX = playerPos.x + (mouseX - playerPos.x) / 3
        const targetY = playerPos.y + (mouseY - playerPos.y) / 3
        this.x = this.clamp(targetX - this.canvasWidth / 2, this.minX, this.maxX)
        this.y = this.clamp(targetY - this.canvasHeight / 2, this.minY, this.maxY)
    }

    transformContext(context) {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.translate(-this.x, -this.y)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
}
