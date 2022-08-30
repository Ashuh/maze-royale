export class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    add(x, y) {
        return new Point(this.x + x, this.y + y)
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

    /**
     * Creates a copy of this Point
     */
    copy() {
        return new Point(this.x, this.y)
    }
}
