import { Maze } from './maze.js'
import { Point } from './point.js'
import { Projectile } from './projectile.js'

export class Game {
    constructor(player) {
        this.player = player
        this.projectiles = []
        this.keyA = false
        this.keyW = false
        this.keyS = false
        this.keyD = false
        this.mousePosition = new Point(0, 0)
        this.maze = new Maze(100, 20, 20)
    }

    update() {
        this.player.lookAtPoint(this.mousePosition)
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
        const dirPoint = new Point(xDir, yDir)
        const heading = new Point(0, 0).angleTo(dirPoint)
        this.player.setMovementHeading(heading)
    }

    setMousePosition(mouseX, mouseY) {
        this.mousePosition = new Point(mouseX, mouseY)
    }

    onMouseClick() {
        const projectile = new Projectile(
            this.player.position.copy(),
            this.player.gunHeading,
            10,
            this.player.color
        )
        this.projectiles.push(projectile)
    }

    draw(context) {
        this.maze.draw(context)
        this.player.draw(context)
        this.projectiles.forEach((projectile) => {
            projectile.draw(context)
        })
    }
}
