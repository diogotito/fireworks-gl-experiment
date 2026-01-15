import * as G from "./minigl.mjs";

class Particle {
    /** @type {number} */
    lifetime = 1.0;

    /** @type {number} */
    timeOffset = 0.0;

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

    toArray() {
        return [
            this.lifetime,
            this.timeOffset,
            ...this.startPos,
            ...this.startVel,
            this.acc.x, this.acc.y,
            this.startSize,
            this.endSize,
            ...this.startColor,
            ...this.endColor,
        ]
    }

    *[Symbol.iterator]() {
        yield* this.toArray();
    }
}

const vertexProto = {
    toArray() {
        return Object.keys(Object.getPrototypeOf(this))
            .flatMap(attr => this[attr])
    },

    /**
     * @param {Float32Array} array 
     * @param {number} offset 
     */
    writeTo(array, offset = 0) {
        for (const attrName of Object.keys(particleProto)) {
            const attrVal = this[attrName];
            if (typeof attrVal === "number") {
                array[offset++] = attrVal;
            } else {
                // Assume it's an Array or Array-like object
                array.set(attrVal, offset);
                offset += attrVal.length;
            }
        }
    }
}

const particleProto = {
    __proto__: vertexProto,

    lifetime: 1.0,
    timeOffset: 0.0,
    startPos: new G.Vec2(0.0, 0.0),
    startVel: new G.Vec2(0.0, 0.0),
    acc: new G.Vec2(0.0, -9.8),
    startSize: 1.0,
    endSize: 1.0,
    startColor: new G.RGBA(1.0, 1.0, 1.0, 1.0),
    endColor: new G.RGBA(0.5, 0.2, 0.3, 1.0),
};

Object.defineProperties(particleProto, {
    NUM_ELEMENTS: { value: particleProto.toArray().length },
    ATTRIBUTE_NAMES: { value: Object.keys(particleProto) },
});

globalThis.particleProto = particleProto;
export default particleProto;




// Generalized
const generalizedProto = {
    *[Symbol.iterator]() {
        for (const attribute of Object.keys(particleProto)) {
            const protoAttr = particleProto[attribute];
            const thisAttr = this[attribute];

            if (typeof protoAttr === "number" && typeof thisAttr === "number")
                yield thisAttr;
            else if (typeof protoAttr === "object" && typeof thisAttr === "object") {
                yield* Array.from({ ...protoAttr, ...thisAttr, length: protoAttr.length });
            } else {
                throw new Error(`Attribute "${attribute}" should be like ${protoAttr} (${typeof protoAttr})`);
            }
        }
    }
}