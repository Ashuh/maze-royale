const { Line } = require('./line.js')
const { Maze } = require('./maze.js')
const { Point } = require('./point.js')
const { Player } = require('./player.js')
const { Projectile } = require('./projectile.js')
const { RayCaster } = require('./rayCaster.js')

class Game {
    constructor(id) {
        this.id = id
        this.isStarted = false
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
        const player = new Player(id, spawn, 0, radius, 'blue')
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
        for (const id of Object.keys(this.players)) {
            const player = this.players[id]
            if (!player.isAlive) {
                continue
            }
            player.move(dt, this.wallLines)
            player.updateVisibilityPolygon(this.rayCaster)
            if (player.isFiring && player.gun.isReady()) {
                this.projectiles.push(player.fireWeapon())
            }
        }

        this.projectiles.forEach((projectile, projIndex) => {
            projectile.move(dt)
            if (projectile.distTraveled > Projectile.getMaxRange()) {
                this.deleteProjectile(projIndex)
            }

            const projectileLine = new Line(
                projectile.getPrevPosition(),
                projectile.position
            )

            for (const line of this.wallLines) {
                if (projectileLine.intersectsWith(line)[0]) {
                    this.deleteProjectile(projIndex)
                    break
                }
            }

            for (const id of Object.keys(this.players)) {
                const player = this.players[id]
                if (!player.isAlive) {
                    continue
                }
                const playerIsImmune =
                    projectile.player === player &&
                    projectile.playerImmunity > 0
                if (playerIsImmune) {
                    continue
                }
                if (player.isCollidingWithLine(projectileLine)) {
                    this.deleteProjectile(projIndex)
                    player.health -= projectile.damage
                    if (player.health <= 0) {
                        this.killPlayer(id, projectile.player.id)
                    }
                    break
                }
            }
        })
    }

    setDirectionalKeys(id, keyW, keyA, keyS, keyD) {
        const player = this.getPlayerById(id)
        if (player == null) {
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
            return
        }
        player.mousePos = new Point(x, y)
    }

    setCameraPosition(id, x, y) {
        const player = this.getPlayerById(id)
        if (player == null) {
            return
        }
        player.cameraPos = new Point(x, y)
    }

    setIsFiring(id, isFiring) {
        const player = this.getPlayerById(id)
        if (player == null) {
            return
        }
        player.isFiring = isFiring
    }

    setIsAiming(id, isAiming) {
        const player = this.getPlayerById(id)
        if (player == null) {
            return
        }
        player.isAiming = isAiming
    }

    // mouseClick(id) {
    //     const player = this.getPlayerById(id)
    //     if (player == null) {
    //         console.log('player ' + id + ' does not exist')
    //         return
    //     }

    //     const projectile = new Projectile(
    //         player,
    //         player.gunHeading,
    //         3000,
    //         player.color
    //     )
    //     this.projectiles.push(projectile)
    // }

    killPlayer(toKill, killer) {
        const player = this.getPlayerById(toKill)
        if (player == null) {
            console.log('player ' + toKill + ' does not exist')
            return
        }
        player.isAlive = false
        player.killedBy = killer
    }

    deletePlayer(id) {
        delete this.players[id]
    }

    deleteProjectile(index) {
        this.projectiles.splice(index, 1)
    }
}

module.exports = {
    Game
}
