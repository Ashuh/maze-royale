import { Point } from './point.js'

export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.position = new Point(0, 0)
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight
    }

    update(playerPosition) {
        // TODO: Only works when world is larger than canvas!!
        this.position.x = this.clamp(
            playerPosition.x - this.canvasWidth / 2,
            0,
            this.worldWidth - this.canvasWidth
        )
        this.position.y = this.clamp(
            playerPosition.y - this.canvasHeight / 2,
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
