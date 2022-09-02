import { Vector } from './vector.js'

export class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    add(vector) {
        return new Point(this.x + vector.x, this.y + vector.y)
    }

    /**
     * Calculates the angle from this Point to another Point
     * @param {Point} otherPoint
     * @returns Angle in radians to otherPoint in canvas coordinate frame
     */
    angleTo(otherPoint) {
        const dy = otherPoint.y - this.y
        const dx = otherPoint.x - this.x
        return -Math.atan2(dy, dx) + Math.PI / 2
    }

    distanceTo(otherPoint) {
        const dx = this.x - otherPoint.x
        const dy = this.y - otherPoint.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    projectionOnto(line) {
        const lineStartToPoint = Vector.between(line.position, this)
        const lineVec = Vector.between(line.position, line.endPosition)
        const projPercentage =
            lineStartToPoint.dotProduct(lineVec) / Math.pow(line.length, 2)
        return line.position.add(lineVec.scalarProduct(projPercentage))
    }

    /**
     * Creates a copy of this Point
     */
    copy() {
        return new Point(this.x, this.y)
    }
}
