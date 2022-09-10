const { Point } = require('./point.js')

class Line {
    static #EPSILON = 1e-10

    constructor(start, end) {
        this.position = start

        const dx = end.x - start.x
        const dy = end.y - start.y

        this.heading = start.angleTo(end)
        this.length = Math.sqrt(dx * dx + dy * dy)
        this.xUnit = Math.cos(this.heading)
        this.yUnit = Math.sin(this.heading)
        this.endPosition = end
    }

    /**
     * Adapted from {@link https://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect post by Gunter Blache}
     * @param {Line} other Another line
     * @returns [true/false, distance to intersect from start of this line, intersect Point]
     */
    intersectsWith(other) {
        const dx = other.position.x - this.position.x
        const dy = other.position.y - this.position.y
        const det = other.xUnit * this.yUnit - other.yUnit * this.xUnit

        if (det === 0) {
            return [false, -1, null]
        }

        const intersectDistance = (dy * other.xUnit - dx * other.yUnit) / det
        const otherIntersectDistance = (dy * this.xUnit - dx * this.yUnit) / det

        const isIntersecting =
            intersectDistance >= -Line.#EPSILON &&
            intersectDistance <= this.length + Line.#EPSILON &&
            otherIntersectDistance >= -Line.#EPSILON &&
            otherIntersectDistance <= other.length + Line.#EPSILON

        const intersectionX = this.position.x + intersectDistance * this.xUnit
        const intersectionY = this.position.y + intersectDistance * this.yUnit

        return [
            isIntersecting,
            intersectDistance,
            new Point(intersectionX, intersectionY)
        ]
    }
}

module.exports = {
    Line
}
