class VisibilityPolygon {
    constructor(points) {
        this.points = points
    }

    draw(context) {
        context.globalCompositeOperation = 'destination-out'
        context.beginPath()
        context.moveTo(this.points[0].x, this.points[0].y)
        this.points.forEach((point) => context.lineTo(point.x, point.y))
        context.closePath()
        context.fill()
        context.globalCompositeOperation = 'source-over'
    }
}

module.exports = {
    VisibilityPolygon
}
