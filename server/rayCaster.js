const { Ray } = require('./ray.js')
const { VisibilityPolygon } = require('./visibilityPolygon.js')

class RayCaster {
    static EPSILON = 1e-12

    constructor(mazeWalls) {
        this.points = mazeWalls.flatMap((wall) => wall.getEndPoints())
        this.wallLines = mazeWalls.map((wall) => wall.getLines())
    }

    getVisibilityPolygon(rayOrigin) {
        const pointsAndAngles = this.points
            .map((point) => [point, rayOrigin.angleTo(point)])
            .sort((a, b) => a[1] - b[1])
        const intersectPoints = []

        pointsAndAngles.forEach((pointAndAngle) => {
            const ray = new Ray(rayOrigin, pointAndAngle[1])

            const rayBefore = ray.offsetHeading(-RayCaster.EPSILON)
            const rayAfter = ray.offsetHeading(RayCaster.EPSILON)

            const nearestIntersectingPoint1 =
                this.getRayNearestIntersectingPoint(rayBefore, this.wallLines)
            const nearestIntersectingPoint =
                this.getRayNearestIntersectingPoint(ray, this.wallLines)
            const nearestIntersectingPoint2 =
                this.getRayNearestIntersectingPoint(rayAfter, this.wallLines)

            if (nearestIntersectingPoint1 != null) {
                intersectPoints.push(nearestIntersectingPoint1)
            }
            if (nearestIntersectingPoint != null) {
                intersectPoints.push(nearestIntersectingPoint)
            }

            if (nearestIntersectingPoint2 != null) {
                intersectPoints.push(nearestIntersectingPoint2)
            }
        })

        return new VisibilityPolygon(intersectPoints)
    }

    getRayNearestIntersectingPoint(ray, lines) {
        let minIntersectDist = Number.POSITIVE_INFINITY
        let nearestIntersectingPoint = null
        lines.forEach((line) => {
            const [isIntersecting, intersectDist, interSectPoint] =
                ray.intersectsWith(line)

            if (isIntersecting && intersectDist < minIntersectDist) {
                nearestIntersectingPoint = interSectPoint
                minIntersectDist = intersectDist
            }
        })
        return nearestIntersectingPoint
    }
}

module.exports = {
    RayCaster
}
