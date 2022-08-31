import { Point } from './point.js'

export class Line {
    static EPSILON = 1e-12

    constructor(position, heading, length) {
        this.position = position
        this.heading = heading
        this.length = length
        this.xUnit = Math.sin(heading)
        this.yUnit = Math.cos(heading)
    }

    /**
     * Adapted from {@link https://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect post by Gunter Blache}
     * @param {Line} other Another line
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
            intersectDistance >= -Line.EPSILON &&
            intersectDistance <= this.length + Line.EPSILON &&
            otherIntersectDistance >= -Line.EPSILON &&
            otherIntersectDistance <= other.length + Line.EPSILON

        const intersectionX = this.position.x + intersectDistance * this.xUnit
        const intersectionY = this.position.y + intersectDistance * this.yUnit

        return [
            isIntersecting,
            intersectDistance,
            new Point(intersectionX, intersectionY)
        ]
    }

    draw(context) {
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(this.position.x, this.position.y)
        const endX = this.position.x + this.xUnit * this.length
        const endY = this.position.y + this.yUnit * this.length
        context.lineTo(endX, endY)
        context.stroke()
    }
}
