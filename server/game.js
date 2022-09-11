const { Line } = require('./line.js')
const { Maze } = require('./maze.js')
const { Point } = require('./point.js')
const { Player } = require('./player.js')
const { Projectile } = require('./projectile.js')
const { RayCaster } = require('./rayCaster.js')

class Game {
    constructor(id, playerDeathListener) {
        this.id = id
        this.playerDeathListener = playerDeathListener
        this.players = {}
        this.playersRemaining = 0
        this.maze = new Maze(200, 10, 10)
        this.projectiles = []
        this.wallLines = this.maze
            .getAllClosedWalls()
            .map((wall) => wall.getLines())
        this.rayCaster = new RayCaster(this.maze.getAllClosedWalls())
        this.playerIdToRanking = {}
        this.playerIdToKiller = {}
    }

    spawnNewPlayer(user) {
        const radius = 15
        const spawn = this.maze.getRandomSpawn(radius)
        this.players[user.id] = new Player(user.id, user.name, spawn, 0, radius, 'blue')
        this.playersRemaining += 1
    }

    getPlayerById(id) {
        return this.players[id]
    }

    getState() {
        const state = {}
        state.players = this.players
        state.projectiles = this.projectiles
        state.playersRemaining = this.playersRemaining
        return state
    }

    getResults() {
        const results = {}
        results.numPlayers = Object.keys(this.players).length
        results.playerIdToRanking = this.playerIdToRanking
        results.playerIdToKiller = this.playerIdToKiller
        return results
    }

    update(dt) {
        if (this.playersRemaining === 1) {
            return true
        }

        for (const id of Object.keys(this.players)) {
            const player = this.players[id]
            if (!player.isAlive()) {
                continue
            }
            player.update(dt, this.wallLines, this.rayCaster)
            if (player.isFiring && player.gun.isReady()) {
                this.projectiles.push(player.fireWeapon())
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i]
            projectile.move(dt)
            if (projectile.distTraveled > Projectile.getMaxRange()) {
                this.#deleteProjectile(i)
            }

            const projectileLine = new Line(
                projectile.getPrevPosition(),
                projectile.position
            )

            for (const line of this.wallLines) {
                if (projectileLine.intersectsWith(line)[0]) {
                    this.#deleteProjectile(i)
                    break
                }
            }

            for (const player of Object.values(this.players)) {
                if (!player.isAlive()) {
                    continue
                }
                const playerIsImmune =
                    projectile.player === player &&
                    projectile.playerImmunity > 0
                if (playerIsImmune) {
                    continue
                }
                if (player.isCollidingWithLine(projectileLine)) {
                    player.hit(projectile)
                    if (!player.isAlive()) {
                        this.registerPlayerDeath(player.id)
                        if (this.playersRemaining === 1) {
                            return true
                        }
                    }
                    this.#deleteProjectile(i)
                    break
                }
            }
        }

        return false
    }

    setDirectionalKeys(id, keyW, keyA, keyS, keyD) {
        const player = this.getPlayerById(id)
        if (player == null) {
            return
        }

        const xDir = (keyA ? -1 : 0) + (keyD ? 1 : 0)
        const yDir = (keyW ? -1 : 0) + (keyS ? 1 : 0)
        const isMoving = xDir !== 0 || yDir !== 0

        if (!isMoving) {
            player.setMovementHeading(null)
        } else {
            const dirPoint = new Point(xDir, yDir)
            const movementHeading = new Point(0, 0).angleTo(dirPoint)
            player.setMovementHeading(movementHeading)
        }
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

    forceKillPlayer(toKill) {
        const player = this.getPlayerById(toKill)
        if (player == null) {
            console.log('player ' + toKill + ' does not exist')
            return
        }
        player.health = 0
        this.registerPlayerDeath(toKill)
    }

    registerPlayerDeath(playerId) {
        const player = this.getPlayerById(playerId)
        const killer = this.getPlayerById(player.killedBy)
        this.playerIdToRanking[playerId] = this.playersRemaining
        this.playerIdToKiller[playerId] = killer
        this.playersRemaining -= 1
        this.playerDeathListener(playerId, this.getResults())

        if (this.playersRemaining === 1) {
            const winner = Object.values(this.players).find((player) => player.isAlive())
            this.playerIdToRanking[winner.id] = 1
        }
    }

    #deleteProjectile(index) {
        this.projectiles.splice(index, 1)
    }
}

module.exports = {
    Game
}
