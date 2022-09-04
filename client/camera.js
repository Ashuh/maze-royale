// import { Point } from '../server/point.js'

export class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        // this.position = new Point(0, 0)
        this.x = 0
        this.y = 0
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight
    }

    update(playerPosition) {
        // TODO: Only works when world is larger than canvas!!
        this.x = this.clamp(
            playerPosition.x - this.canvasWidth / 2,
            0,
            this.worldWidth - this.canvasWidth
        )
        this.y = this.clamp(
            playerPosition.y - this.canvasHeight / 2,
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
