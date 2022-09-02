import { Camera } from './camera.js'
import { Line } from './line.js'
import { Maze } from './maze.js'
import { Point } from './point.js'
import { Projectile } from './projectile.js'
import { RayCaster } from './rayCaster.js'
import { Vector } from './vector.js'

export class Game {
    constructor(player, contextBg, contextFow, contextFg, contextDebug) {
        this.player = player
        this.projectiles = []
        this.keyA = false
        this.keyW = false
        this.keyS = false
        this.keyD = false
        this.mousePosition = new Point(0, 0)
        this.maze = new Maze(300, 15, 15)

        const mazeWidth = this.maze.cellSize * this.maze.cols
        const mazeHeight = this.maze.cellSize * this.maze.rows

        this.camera = new Camera(
            contextBg.canvas.width,
            contextBg.canvas.height,
            mazeWidth,
            mazeHeight
        )

        this.contextBg = contextBg
        this.contextFow = contextFow
        this.contextFg = contextFg
        this.contextDebug = contextDebug

        this.wallLines = this.maze
            .getAllClosedWalls()
            .map((wall) => wall.getLines())

        this.rayCaster = new RayCaster(
            this.maze.getAllClosedWalls(),
            this.player.position
        )

        // debug
        this.visibilityPolygon = null
    }

    update() {
        // Transform coordinates from camera frame to world frame
        const mousePosTransformed = this.mousePosition.add(
            Vector.between(new Point(0, 0), this.camera.position)
        )
        this.player.lookAtPoint(mousePosTransformed)
        this.player.move(this.wallLines)

        this.projectiles.forEach((projectile, projIndex) => {
            projectile.move()
            if (projectile.distTraveled > 2000) {
                this.projectiles.splice(projIndex, 1)
            }
        })

        this.camera.update(this.player.position)
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

    draw() {
        this.drawBg()
        this.drawFow()
        this.drawFg()
        this.drawDebug()
    }

    drawBg() {
        this.camera.transformContext(this.contextBg)
        this.clearContext(this.contextBg)

        this.projectiles.forEach((projectile) => {
            projectile.draw(this.contextBg)
        })
    }

    drawFow() {
        this.camera.transformContext(this.contextFow)
        this.clearContext(this.contextFow)
        this.contextFow.fillStyle = 'rgba(0, 0, 0, 1)'
        this.contextFow.fillRect(
            this.camera.position.x,
            this.camera.position.y,
            this.contextFow.canvas.width,
            this.contextFow.canvas.height
        )

        this.visibilityPolygon = this.rayCaster.getVisibilityPolygon(
            this.player.position
        )

        this.visibilityPolygon.draw(this.contextFow)
    }

    drawFg() {
        this.camera.transformContext(this.contextFg)
        this.clearContext(this.contextFg)
        this.maze.draw(this.contextFg)
        this.player.draw(this.contextFg)
    }

    drawDebug() {
        this.camera.transformContext(this.contextDebug)
        this.clearContext(this.contextDebug)

        this.visibilityPolygon.points
            .map((point) => {
                return new Line(this.player.position, point)
            })
            .forEach((line) => {
                line.draw(this.contextDebug, 'gray', 0.1)
            })
    }

    clearContext(context) {
        context.clearRect(
            this.camera.position.x,
            this.camera.position.y,
            context.canvas.width,
            context.canvas.height
        )
    }
}
