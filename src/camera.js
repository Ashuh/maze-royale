import { Point } from './point.js'

export class Camera {
    constructor(
        playerPosition,
        canvasWidth,
        canvasHeight,
        worldWidth,
        worldHeight
    ) {
        this.position = new Point(0, 0)
        this.playerPosition = playerPosition
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight
    }

    update() {
        this.position.x = this.clamp(
            this.playerPosition.x - this.canvasWidth / 2,
            0,
            this.worldWidth - this.canvasWidth
        )
        this.position.y = this.clamp(
            this.playerPosition.y - this.canvasHeight / 2,
            0,
            this.worldHeight - this.canvasHeight
        )
    }

    transformContext(context) {
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.translate(-this.position.x, -this.position.y)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
}
