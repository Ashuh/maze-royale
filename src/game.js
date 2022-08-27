import { Projectile } from './projectile.js'

export class Game {
    constructor(player) {
        this.player = player
        this.projectiles = []
        this.keyA = false
        this.keyW = false
        this.keyS = false
        this.keyD = false
        this.mouseX = 0
        this.mouseY = 0
    }

    update() {
        const heading = this.calcAngle(
            this.player.x,
            this.player.y,
            this.mouseX,
            this.mouseY
        )
        this.player.setGunHeading(heading)
        this.player.move()

        this.projectiles.forEach((projectile, projIndex) => {
            projectile.move()
            if (projectile.distTraveled > 2000) {
                this.projectiles.splice(projIndex, 1)
            }
        })
    }

    setDirectionalKeys(keyW, keyA, keyS, keyD) {
        this.keyW = keyW
        this.keyA = keyA
        this.keyS = keyS
        this.keyD = keyD

        const xDir = (keyA ? -1 : 0) + (keyD ? 1 : 0)
        const yDir = (keyW ? -1 : 0) + (keyS ? 1 : 0)
        const isMoving = xDir !== 0 || yDir !== 0
        this.player.setIsMoving(isMoving)
        const heading = this.calcAngle(0, 0, xDir, yDir)
        this.player.setMovementHeading(heading)
    }

    setMousePosition(mouseX, mouseY) {
        this.mouseX = mouseX
        this.mouseY = mouseY
    }

    onMouseClick() {
        const projectile = new Projectile(
            this.player.x,
            this.player.y,
            this.player.gunHeading,
            10,
            this.player.color
        )
        this.projectiles.push(projectile)
    }

    /**
     * Calculates the angle between 2 points
     * @param {int} x1 - x coordinate of source point
     * @param {unt} y1 - y coordinate of source point
     * @param {int} x2 - x coordinate of target point
     * @param {int} y2 - y coordinate of target point
     * @returns Angle in radians from point (x1, y1) to point (x2, y2) in canvas coordinate frame
     */
    calcAngle(x1, y1, x2, y2) {
        return -Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2
    }

    draw(context) {
        this.player.draw(context)
        this.projectiles.forEach((projectile) => {
            projectile.draw(context)
        })
    }
}
