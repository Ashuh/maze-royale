export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.x = 0
        this.y = 0
        this.playerX = 0
        this.playerY = 0
        this.mouseX = 0
        this.mouseY = 0
        this.isZoomed = false
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

    update() {
        // move camera 20% or 50% towards mouse depending on whether zoom is enabled
        const offsetX = (this.mouseX - this.playerX) / (this.isZoomed ? 2 : 5)
        const offsetY = (this.mouseY - this.playerY) / (this.isZoomed ? 2 : 5)
        // point to keep in center of frame
        const centerX = this.playerX + offsetX
        const centerY = this.playerY + offsetY
        // coordinates of top left corner
        const targetX = centerX - this.canvasWidth / 2
        const targetY = centerY - this.canvasHeight / 2

        const errX = targetX - this.x
        const errY = targetY - this.y

        const gain = 0.05
        this.x = this.clamp(this.x + errX * gain, this.minX, this.maxX)
        this.y = this.clamp(this.y + errY * gain, this.minY, this.maxY)
    }

    setMousePosition(x, y) {
        // Convert mouse position in canvas frame to world frame
        this.mouseX = this.x + x
        this.mouseY = this.y + y
    }

    setPlayerPosition(x, y) {
        this.playerX = x
        this.playerY = y
    }

    transformContext(context) {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.translate(-this.x, -this.y)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
}
