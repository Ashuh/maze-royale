const { Ray } = require('./ray.js')

class RayCaster {
    static #EPSILON = 1e-12

    constructor(mazeWalls) {
        this.points = mazeWalls.flatMap((wall) => wall.getEndPoints())
        this.wallLines = mazeWalls.map((wall) => wall.getLines())
    }

    getVisibilityPolygon(player) {
        const rayOrigin = player.position
        const halfFov = player.fov / 2

        const absAngles = this.points.flatMap((point) => {
            const angle = rayOrigin.angleTo(point)
            return [
                angle - RayCaster.#EPSILON, // cast just before point
                angle, // cast directly to point
                angle + RayCaster.#EPSILON // cast just after point
            ]
        })
        absAngles.push(player.gunHeading - halfFov, player.gunHeading + halfFov) // cast towards the limits of fov

        const intersectPoints = [player.position]
        const maxRelAngleOffset = halfFov + RayCaster.#EPSILON // add EPSILON to prevent flickering at edges
        absAngles
            .map((angle) => [
                angle,
                this.#angleDifference(player.gunHeading, angle) // angle relative to gun heading
            ])
            .filter(([abs, rel]) => Math.abs(rel) <= maxRelAngleOffset) // remove angles outside fov
            .sort(([absA, relA], [absB, relB]) => relA - relB)
            .map(([abs, rel]) => new Ray(rayOrigin, abs))
            .forEach((ray) => {
                const point = this.#getRayNearestIntersectingPoint(
                    ray,
                    this.wallLines
                )
                if (point != null) {
                    intersectPoints.push(point)
                }
            })

        intersectPoints.push(player.position)
        return intersectPoints
    }

    #getRayNearestIntersectingPoint(ray, lines) {
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

    /**
     * Calculates the difference between two angles.
     * Adapted from {@link https://stackoverflow.com/a/28037434 Stack Overflow}
     */
    #angleDifference(a, b) {
        const diff = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI
        return diff < -Math.PI ? diff + 2 * Math.PI : diff
    }
}

module.exports = {
    RayCaster
}
