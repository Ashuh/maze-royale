import { Vector } from './vector.js'

export class Triangle {
    constructor(a, b, c) {
        this.a = a
        this.b = b
        this.c = c
    }

    getArea() {
        const ab = Vector.between(this.a, this.b)
        const ac = Vector.between(this.a, this.c)
        const crossProduct = ab.crossProduct(ac)
        return Math.abs(crossProduct) / 2
    }
}
