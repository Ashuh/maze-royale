import { Line } from './line.js'
import { Point } from './point.js'
export class Ray extends Line {
    constructor(position, heading) {
        const end = new Point(
            position.x + Math.sin(heading) * Number.MAX_VALUE,
            position.y + Math.cos(heading) * Number.MAX_VALUE
        )
        super(position, end)
    }

    offsetHeading(offset) {
        return new Ray(this.position, this.heading + offset)
    }
}
