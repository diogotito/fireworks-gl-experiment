class VectorLike extends Array {

  // Meta...
  static nameIndex(index, name) {
    Object.defineProperty(this.prototype, name, {
      get() { return this[index]; },
      set(val) { this[index] = val; },
    });
  }

  get toString() {
    return `${this.constructor.name}(${this.join`, `})`;
  }

  get [Symbol.toStringTag]() { return this.constructor.name; }
}

function __setupIndex(idx, ) {

}

export class RGBA extends VectorLike {
  static {
    Object.entries("rgba").forEach(kv => this.nameIndex(...kv))
  }

  constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
    super(r, g, b, a);
  }
}

export class Vec2 extends VectorLike {
  static {
    this.nameIndex(0, "x");
    this.nameIndex(1, "y");
  }

  constructor(x = 0.0, y = 0.0) {
    super(x, y)
  }

  static polar(theta, radius) {
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    return new Vec2(x, y);
  }

  add_xy(dx, dy) {
    return new Vec2(this.x + dx, this.y + dy);
  }
  add(vec2) {
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
  }

  toArray() { return [this.x, this.y]; }
}

globalThis.RGBA = RGBA;
globalThis.Vec2 = Vec2;

export function vec2(...args) {
  return new Vec2(...args);
}

export function add2(v1, v2) {
  return v1.add(v2);
}

export class Shader {
  /**
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl
   * @param {string} vSrc
   * @param {string} fSrc
   */
  constructor(gl, vSrc, fSrc) {
    this.gl = gl;

    const validateHOF =
      (glCtx, shaderOrProgram, paramPrefix) => (typeMsg, glObj) => {
        if (
          !glCtx[`get${shaderOrProgram}Parameter`](
            glObj,
            glCtx[paramPrefix + "_STATUS"],
          )
        ) {
          let msg = glCtx[`get${shaderOrProgram}InfoLog`](glObj);
          throw new Error(
            `Failed to ${paramPrefix.toLowerCase()} ${typeMsg.toLowerCase()} ${shaderOrProgram.toLowerCase()}:\n${msg}`,
          );
        }
      };

    const mkShader = (type, src) => {
      let shader = gl.createShader(gl[type + "_SHADER"]);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      validateHOF(gl, "Shader", "COMPILE")(type, shader);
      return shader;
    };

    this.vs = mkShader("VERTEX", vSrc);
    this.fs = mkShader("FRAGMENT", fSrc);

    // Link shader program
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    validateHOF(gl, "Program", "LINK")("shader", this.program);
  }

  use() {
    this.gl.useProgram(this.program);
  }
}

globalThis.Shader = Shader;

function debounce(f, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => f(...args), ms);
  };
}
