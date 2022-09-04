const { Triangle } = require('./triangle.js')
const { Vector } = require('./vector.js')

class Circle {
    constructor(position, radius) {
        this.position = position
        this.radius = radius
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

    isCollidingWithCircle(circle) {
        const dist =
            this.position.distanceTo(circle.position) -
            this.radius -
            circle.radius
        return dist <= 0
    }
}

module.exports = {
    Circle
}
