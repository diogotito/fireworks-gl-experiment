import * as G from "./minigl.mjs";

export default class Particle {
    /** @type {number} */
    lifetime = 1.0;

    /** @type {G.Vec2} */
    startPos = new G.Vec2(0.0, 0.0);

    /** @type {G.Vec2} */
    startVel = new G.Vec2(0.0, 0.0);

    /** @type {G.Vec2} */
    acc = new G.Vec2(0.0, -9.8);

    /** @type {number} */
    startSize = 1.0;

    /** @type {number} */
    endSize = 1.0;

    /** @type {G.RGBA} */
    startColor = new G.RGBA(1.0, 1.0, 1.0, 1.0);

    /** @type {G.RGBA} */
    endColor = new G.RGBA(0.5, 0.2, 0.3, 1.0);

    asFloats() {
        return [
            this.lifetime,
            this.startPos.x, this.startPos.y,
            this.startVel.x, this.startVel.y,
            this.acc.x, this.acc.y,
            this.startSize,
            this.endSize,
            this.startColor.r, this.startColor.g, this.startColor.b, this.startColor.a,
            this.endColor.r, this.endColor.g, this.endColor.b, this.endColor.a,
        ]
    }

    *[Symbol.iterator]() {
        yield* this.asFloats();
    }
}
