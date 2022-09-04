class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static between(a, b) {
        return new Vector(b.x - a.x, b.y - a.y)
    }

    scalarProduct(scalar) {
        return new Vector(this.x * scalar, this.y * scalar)
    }

    crossProduct(otherVector) {
        return this.x * otherVector.y - this.y * otherVector.x
    }

    dotProduct(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y
    }
}

module.exports = {
    Vector
}
