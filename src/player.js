import { Line } from './line.js'
import { Triangle } from './triangle.js'
import { Vector } from './vector.js'

export class Player {
    constructor(position, movementHeading, gunHeading, radius, color) {
        this.position = position
        this.movementHeading = movementHeading
        this.gunHeading = gunHeading
        this.radius = radius
        this.color = color
        this.maxSpeed = 3
        this.isMoving = false
    }

    setIsMoving(isMoving) {
        this.isMoving = isMoving
    }

    lookAtPoint(point) {
        const heading = this.position.angleTo(point)
        this.gunHeading = heading
    }

    setMovementHeading(movementHeading) {
        this.movementHeading = movementHeading
    }

    move(wallLines) {
        if (!this.isMoving) {
            return
        }

        const curPos = this.position.copy()
        const xVel = this.maxSpeed * Math.sin(this.movementHeading)
        const yVel = this.maxSpeed * Math.cos(this.movementHeading)
        const desiredPos = this.position.add(new Vector(xVel, yVel))
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
            isResolved &&= !this.isCollidingWithLine(allLines[i++])
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

    isCollidingWithLine(line) {
        const centerToLineStart = Vector.between(this.position, line.position)
        const lineEndToLineStart = Vector.between(
            line.endPosition,
            line.position
        )
        const centerToLineEnd = Vector.between(this.position, line.endPosition)
        const lineStartToLineEnd = Vector.between(
            line.position,
            line.endPosition
        )

        let minDist = Number.MAX_VALUE
        const projectionLiesOnLine =
            centerToLineStart.dotProduct(lineEndToLineStart) > 0 &&
            centerToLineEnd.dotProduct(lineStartToLineEnd) > 0

        if (projectionLiesOnLine) {
            const triangleArea = new Triangle(
                this.position,
                line.position,
                line.endPosition
            ).getArea()
            minDist = (2 * triangleArea) / line.length
        } else {
            // point closest to the center must be either the start or end of the line
            minDist = Math.min(
                this.position.distanceTo(line.position),
                this.position.distanceTo(line.endPosition)
            )
        }

        return minDist <= this.radius
    }

    draw(context) {
        context.beginPath()
        context.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false
        )
        context.fillStyle = this.color
        context.fill()

        context.beginPath()
        context.moveTo(this.position.x, this.position.y)
        const endX = this.position.x + Math.sin(this.gunHeading) * 100
        const endY = this.position.y + Math.cos(this.gunHeading) * 100
        context.lineTo(endX, endY)
        context.strokeStyle = 'red'
        context.stroke()
    }
}
