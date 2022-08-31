import { Line } from './Line.js'

export class Ray extends Line {
    static DRAW_LENGTH = 10000

    constructor(position, heading) {
        super(position, heading, Number.POSITIVE_INFINITY)
    }

    offsetHeading(offset) {
        return new Line(this.position, this.heading + offset, this.length)
    }

    draw(context) {
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(this.position.x, this.position.y)
        const endX = this.position.x + this.xUnit * Ray.DRAW_LENGTH
        const endY = this.position.y + this.yUnit * Ray.DRAW_LENGTH
        context.lineTo(endX, endY)
        context.stroke()
    }
}
