const { Circle } = require('./circle.js')
const { Line } = require('./line.js')
const { Point } = require('./point.js')
const { Vector } = require('./vector.js')

class Player extends Circle {
    constructor(position, gunHeading, radius, color) {
        super(position, radius)
        this.gunHeading = gunHeading
        this.color = color
        this.maxSpeed = 500
        this.keyW = false
        this.keyA = false
        this.keyS = false
        this.keyD = false
        this.mousePos = new Point(0, 0)
        this.cameraPos = new Point(0, 0)
        this.visibilityPolygon = null
    }

    setIsMoving(isMoving) {
        this.isMoving = isMoving
    }

    move(dt, wallLines) {
        // Transform coordinates from camera frame to world frame
        const mousePosTransformed = this.mousePos.add(
            Vector.between(new Point(0, 0), this.cameraPos)
        )
        this.gunHeading = this.position.angleTo(mousePosTransformed)

        const xDir = (this.keyA ? -1 : 0) + (this.keyD ? 1 : 0)
        const yDir = (this.keyW ? -1 : 0) + (this.keyS ? 1 : 0)
        const isMoving = xDir !== 0 || yDir !== 0

        if (!isMoving) {
            return
        }

        const dirPoint = new Point(xDir, yDir)
        const movementHeading = new Point(0, 0).angleTo(dirPoint)

        const curPos = this.position.copy()
        const xVel = this.maxSpeed * Math.sin(movementHeading) * dt
        const yVel = this.maxSpeed * Math.cos(movementHeading) * dt
        const desiredPos = this.position.add(new Vector(xVel, yVel))
        console.log(xVel, yVel)
        this.position = desiredPos
        let isResolved = true

        for (const line of wallLines) {
            if (!this.isCollidingWithLine(line)) {
                continue
            }
            isResolved = this.resolveCollision(
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

    resolveCollision(curPos, desiredPos, line, allLines) {
        // possible improvement to avoid the weird behavior at 3-way line intersections:
        // find all colliding lines and points
        // try to resolve by sliding along each line
        // if still not resolved, try to slide around each point

        if (this.resolveLineCollision(curPos, desiredPos, line, allLines)) {
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

        return this.resolvePointCollision(
            curPos,
            desiredPos,
            collidingPoint,
            allLines
        )
    }

    resolveLineCollision(curPos, desiredPos, line, allLines) {
        const lineVec = new Vector(line.xUnit, line.yUnit)
        const travelLine = new Line(curPos, curPos.add(lineVec))
        this.position = desiredPos.projectionOnto(travelLine)

        const hasMoved =
            this.position.x !== curPos.x || this.position.y !== curPos.y
        let isResolved = hasMoved
        let i = 0
        while (isResolved && i < allLines.length) {
            isResolved = isResolved && !this.isCollidingWithLine(allLines[i++])
        }

        if (!isResolved) {
            this.position = desiredPos
        }
        return isResolved
    }

    resolvePointCollision(curPos, desiredPos, point, allLines) {
        let tangentAngle = point.angleTo(curPos)
        if (tangentAngle < Math.PI) {
            tangentAngle -= Math.PI / 2
        } else {
            tangentAngle += Math.PI / 2
        }

        const tangentVec = new Vector(
            Math.sin(tangentAngle),
            Math.cos(tangentAngle)
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

    updateVisibilityPolygon(rayCaster) {
        this.visibilityPolygon = rayCaster.getVisibilityPolygon(this.position)
    }
}

module.exports = {
    Player
}