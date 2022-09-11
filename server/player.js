const { Circle } = require('./circle.js')
const { Gun } = require('./gun.js')
const { Line } = require('./line.js')
const { Point } = require('./point.js')
const { Vector } = require('./vector.js')

class Player extends Circle {
    constructor(id, name, position, gunHeading, radius, color) {
        super(position, radius)
        this.id = id
        this.name = name
        this.movementHeading = null // null if not moving
        this.gunHeading = gunHeading
        this.color = color
        this.health = 100
        this.killedBy = null
        this.gun = new Gun()
        this.maxFov = (Math.PI * 2) / 3 // 120 degrees
        this.targetFov = this.maxFov
        this.fov = this.maxFov
        this.maxSpeed = 500
        this.isFiring = false
        this.isAiming = false
        this.mousePos = new Point(0, 0)
        this.cameraPos = new Point(0, 0)
        this.visibilityPolygon = null
    }

    setMovementHeading(heading) {
        this.movementHeading = heading
    }

    update(dt, wallLines, rayCaster) {
        this.#updateGun(dt)
        this.#updateFov()
        this.#updatePosition(dt, wallLines)
        this.#updateVisibilityPolygon(rayCaster)
    }

    #updateGun(dt) {
        // Transform coordinates from camera frame to world frame
        const mousePosTransformed = this.mousePos.add(
            Vector.between(new Point(0, 0), this.cameraPos)
        )
        this.gunHeading = this.position.angleTo(mousePosTransformed)
        this.gun.update(dt)
    }

    #updateFov() {
        if (this.isAiming) {
            this.targetFov = this.maxFov / 4
        } else {
            this.targetFov = this.maxFov
        }

        const gain = 0.2
        this.fov += (this.targetFov - this.fov) * gain
    }

    #updatePosition(dt, wallLines) {
        if (this.movementHeading == null) {
            return
        }

        const curPos = this.position.copy()
        const xVel = this.maxSpeed * Math.cos(this.movementHeading)
        const yVel = this.maxSpeed * Math.sin(this.movementHeading)
        const desiredPos = this.position.add(
            new Vector(xVel, yVel).scalarProduct(dt)
        )
        this.position = desiredPos
        let isResolved = true

        for (const line of wallLines) {
            if (!this.isCollidingWithLine(line)) {
                continue
            }
            isResolved = this.#resolveCollision(
                curPos,
                desiredPos,
                line,
                wallLines
            )
            if (isResolved) {
                return
            }
        }

        if (!isResolved) {
            this.position = curPos
        }
    }

    #resolveCollision(curPos, desiredPos, line, allLines) {
        // possible improvement to avoid the weird behavior at 3-way line intersections:
        // find all colliding lines and points
        // try to resolve by sliding along each line
        // if still not resolved, try to slide around each point

        if (this.#resolveLineCollision(curPos, desiredPos, line, allLines)) {
            return true
        }

        const isCollidingWithStart =
            desiredPos.distanceTo(line.position) <= this.radius
        const isCollidingWithEnd =
            desiredPos.distanceTo(line.endPosition) <= this.radius

        if (!isCollidingWithStart && !isCollidingWithEnd) {
            return false
        }

        const collidingPoint = isCollidingWithStart
            ? line.position
            : line.endPosition

        return this.#resolvePointCollision(
            curPos,
            desiredPos,
            collidingPoint,
            allLines
        )
    }

    #resolveLineCollision(curPos, desiredPos, line, allLines) {
        const lineVec = new Vector(line.xUnit, line.yUnit)
        const travelLine = new Line(curPos, curPos.add(lineVec))
        this.position = desiredPos.projectionOnto(travelLine)

        let isResolved =
            this.position.x !== curPos.x || this.position.y !== curPos.y
        let i = 0
        while (isResolved && i < allLines.length) {
            isResolved = isResolved && !this.isCollidingWithLine(allLines[i++])
        }

        if (!isResolved) {
            this.position = desiredPos
        }
        return isResolved
    }

    #resolvePointCollision(curPos, desiredPos, point, allLines) {
        const tangentAngle = point.angleTo(curPos) + Math.PI / 2
        const tangentVec = new Vector(
            Math.cos(tangentAngle),
            Math.sin(tangentAngle)
        )
        const travelLine = new Line(curPos, curPos.add(tangentVec))
        this.position = desiredPos.projectionOnto(travelLine)

        for (const line of allLines) {
            if (this.isCollidingWithLine(line)) {
                this.position = desiredPos
                return false
            }
        }
        return true
    }

    #updateVisibilityPolygon(rayCaster) {
        this.visibilityPolygon = rayCaster.getVisibilityPolygon(this)
    }

    fireWeapon() {
        return this.gun.fire(this)
    }

    hit(projectile) {
        this.health -= projectile.damage
        if (this.health < 0) {
            this.killedBy = projectile.player.id
        }
    }

    isAlive() {
        return this.health > 0
    }
}

module.exports = {
    Player
}
