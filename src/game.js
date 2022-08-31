import { Camera } from './camera.js'
import { Maze } from './maze.js'
import { Point } from './point.js'
import { Projectile } from './projectile.js'
import { RayCaster } from './rayCaster.js'

export class Game {
    constructor(player, contextBg, contextFow, contextFg) {
        this.player = player
        this.projectiles = []
        this.keyA = false
        this.keyW = false
        this.keyS = false
        this.keyD = false
        this.mousePosition = new Point(0, 0)
        this.maze = new Maze(200, 10, 10)

        const mazeWidth = this.maze.cellSize * this.maze.cols
        const mazeHeight = this.maze.cellSize * this.maze.rows

        this.camera = new Camera(
            this.player.position,
            contextBg.canvas.width,
            contextBg.canvas.height,
            mazeWidth,
            mazeHeight
        )

        this.contextBg = contextBg
        this.contextFow = contextFow
        this.contextFg = contextFg

        this.rayCaster = new RayCaster(
            this.maze.getAllClosedWalls(),
            this.player.position
        )
    }

    update() {
        // Transform coordinates from camera frame to world frame
        const mousePosTransformed = this.mousePosition.add(
            this.camera.position.x,
            this.camera.position.y
        )
        this.player.lookAtPoint(mousePosTransformed)
        this.player.move()

        this.projectiles.forEach((projectile, projIndex) => {
            projectile.move()
            if (projectile.distTraveled > 2000) {
                this.projectiles.splice(projIndex, 1)
            }
        })

        this.camera.update()
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

        const visibilityPolygon = this.rayCaster.getVisibilityPolygon(
            this.player.position
        )

        visibilityPolygon.draw(this.contextFow)
        this.debugFow(visibilityPolygon)
    }

    drawFg() {
        this.camera.transformContext(this.contextFg)
        this.clearContext(this.contextFg)
        this.maze.draw(this.contextFg)
        this.player.draw(this.contextFg)
    }

    clearContext(context) {
        context.clearRect(
            this.camera.position.x,
            this.camera.position.y,
            context.canvas.width,
            context.canvas.height
        )
    }

    debugFow(visibilityPolygon) {
        for (const p of visibilityPolygon.points) {
            this.drawLine(this.contextFow, 'red', this.player.position, p)
        }
    }

    drawLine(context, color, start, end) {
        context.beginPath()
        context.moveTo(start.x, start.y)
        context.lineTo(end.x, end.y)
        context.strokeStyle = color
        context.stroke()
    }
}
