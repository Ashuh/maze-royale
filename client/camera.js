export class Camera {
    #playerX = 0
    #playerY = 0
    #mouseX = 0
    #mouseY = 0
    #canvasWidth
    #canvasHeight
    #worldWidth
    #worldHeight
    #minX
    #minY
    #maxX
    #maxY
    x = 0
    y = 0
    isZoomed = false

    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.#canvasWidth = canvasWidth
        this.#canvasHeight = canvasHeight
        this.#worldWidth = worldWidth
        this.#worldHeight = worldHeight
        this.#setBoundaries()
    }

    setCanvasSize(width, height) {
        this.#canvasWidth = width
        this.#canvasHeight = height
        this.#setBoundaries()
    }

    #setBoundaries() {
        this.#minX = Math.min(0, (this.#worldWidth - this.#canvasWidth) / 2)
        this.#minY = Math.min(0, (this.#worldHeight - this.#canvasHeight) / 2)
        this.#maxX = Math.max(
            this.#worldWidth - this.#canvasWidth,
            (this.#worldWidth - this.#canvasWidth) / 2
        )
        this.#maxY = Math.max(
            this.#worldHeight - this.#canvasHeight,
            (this.#worldHeight - this.#canvasHeight) / 2
        )
    }

    update() {
        // move camera 20% or 50% towards mouse depending on whether zoom is enabled
        const offsetX = (this.#mouseX - this.#playerX) / (this.isZoomed ? 2 : 5)
        const offsetY = (this.#mouseY - this.#playerY) / (this.isZoomed ? 2 : 5)
        // point to keep in center of frame
        const centerX = this.#playerX + offsetX
        const centerY = this.#playerY + offsetY
        // coordinates of top left corner
        const targetX = centerX - this.#canvasWidth / 2
        const targetY = centerY - this.#canvasHeight / 2

        const errX = targetX - this.x
        const errY = targetY - this.y

        const gain = 0.05
        this.x = this.clamp(this.x + errX * gain, this.#minX, this.#maxX)
        this.y = this.clamp(this.y + errY * gain, this.#minY, this.#maxY)
    }

    setMousePosition(x, y) {
        // Convert mouse position in canvas frame to world frame
        this.#mouseX = this.x + x
        this.#mouseY = this.y + y
    }

    setPlayerPosition(x, y) {
        this.#playerX = x
        this.#playerY = y
    }

    transformContext(context) {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.translate(-this.x, -this.y)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
}
