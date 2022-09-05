const { Line } = require('./line.js')
const { Point } = require('./point.js')

class Ray extends Line {
    constructor(position, heading) {
        const end = new Point(
            position.x + Math.cos(heading) * Number.MAX_VALUE,
            position.y + Math.sin(heading) * Number.MAX_VALUE
        )
        super(position, end)
    }

    offsetHeading(offset) {
        return new Ray(this.position, this.heading + offset)
    }
}

module.exports = {
    Ray
}
