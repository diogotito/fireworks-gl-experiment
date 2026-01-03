export class RGBA {
    /** @type {number} */ r = 0.0;
    /** @type {number} */ g = 0.0;
    /** @type {number} */ b = 0.0;
    /** @type {number} */ a = 1.0;
    
    /**
     * Constructs an RGBA
     * @param {number} r The red component
     * @param {number} g The green component
     * @param {number} b The blue component
     * @param {number} a The alpha component
     */
    constructor(r=0.0, g=0.0, b=0.0, a=1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

export class Vec2 {
    /** @type {number} */ x = 0.0;
    /** @type {number} */ y = 0.0;

    constructor(x=0.0, y=0.0) {
        this.x = x;
        this.y = y;
    }
}

export function vec2(...args) { return new Vec2(...args); }

export function vecPolar(theta, radius) {
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    return new Vec2(x, y);
}

export class Shader {
    /**
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl 
     * @param {string} vSrc 
     * @param {string} fSrc 
     */
    constructor(gl, vSrc, fSrc) {
        this.gl = gl;

        const validateHOF = (glCtx, shaderOrProgram, paramPrefix) => (typeMsg, glObj) => {
            if (!glCtx[`get${shaderOrProgram}Parameter`](
                    glObj, glCtx[paramPrefix + "_STATUS"]
            )) {
                let msg = glCtx[`get${shaderOrProgram}InfoLog`](glObj);
                throw new Error(`Failed to ${paramPrefix.toLowerCase()} ${typeMsg.toLowerCase()} ${shaderOrProgram.toLowerCase()}:\n${msg}`);
            }
        }

        const mkShader = (type, src) => {
            let shader = gl.createShader(gl[type + "_SHADER"]);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            validateHOF(gl, "Shader", "COMPILE")(type, shader)
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

globalThis.Shader = Shader