const { Maze } = require('./maze.js')
const { Point } = require('./point.js')
const { Player } = require('./player.js')
const { Projectile } = require('./projectile.js')
const { RayCaster } = require('./rayCaster.js')
const { Vector } = require('./vector.js')

class Game {
    constructor(id) {
        this.id = id
        this.players = {}
        this.projectiles = []
        this.maze = new Maze(200, 10, 10)

        this.wallLines = this.maze
            .getAllClosedWalls()
            .map((wall) => wall.getLines())

        this.rayCaster = new RayCaster(this.maze.getAllClosedWalls())
    }

    spawnNewPlayer(id) {
        const radius = 15
        const spawn = this.maze.getRandomSpawn(radius)
        const player = new Player(spawn, 0, radius, 'blue')
        this.players[id] = player
    }

    getPlayerById(id) {
        return this.players[id]
    }

    getState() {
        const state = {}
        state.players = this.players
        state.projectiles = this.projectiles
        state.visibilityPolygon = this.visibilityPolygon
        return state
    }

    update(dt) {
        Object.keys(this.players).forEach((id) => {
            const player = this.players[id]
            player.move(dt, this.wallLines)
            player.updateVisibilityPolygon(this.rayCaster)
        })

        this.projectiles.forEach((projectile, projIndex) => {
            projectile.move(dt)
            if (projectile.distTraveled > Projectile.getMaxRange()) {
                this.deleteProjectile(projIndex)
            }

            this.wallLines.forEach((line) => {
                if (projectile.isCollidingWithLine(line)) {
                    this.deleteProjectile(projIndex)
                }
            })

            Object.keys(this.players).forEach((id) => {
                const player = this.players[id]
                if (projectile.isCollidingWithCircle(player)) {
                    this.deleteProjectile(projIndex)
                }
            })
        })
    }

    setDirectionalKeys(id, keyW, keyA, keyS, keyD) {
        const player = this.getPlayerById(id)
        if (player == null) {
            console.log('player ' + id + ' does not exist')
            return
        }
        player.keyW = keyW
        player.keyA = keyA
        player.keyS = keyS
        player.keyD = keyD
    }

    setMousePosition(id, x, y) {
        const player = this.getPlayerById(id)
        if (player == null) {
            console.log('player ' + id + ' does not exist')
            return
        }
        player.mousePos = new Point(x, y)
    }

    setCameraPosition(id, x, y) {
        const player = this.getPlayerById(id)
        if (player == null) {
            console.log('player ' + id + ' does not exist')
            return
        }
        player.cameraPos = new Point(x, y)
    }

    mouseClick(id) {
        const player = this.getPlayerById(id)
        if (player == null) {
            console.log('player ' + id + ' does not exist')
            return
        }
        const offset = new Vector(
            Math.cos(player.gunHeading),
            Math.sin(player.gunHeading)
        ).scalarProduct(player.radius + Projectile.getRadius())

        const projectile = new Projectile(
            player.position.add(offset),
            player.gunHeading,
            1000,
            player.color
        )
        this.projectiles.push(projectile)
    }

    killPlayer(id) {
        delete this.players[id]
    }

    deleteProjectile(index) {
        this.projectiles.splice(index, 1)
    }
}

module.exports = {
    Game
}
