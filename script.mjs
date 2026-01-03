import * as G from "./minigl.mjs";
import Particle from "./Particle.mjs";

/** @type HTMLCanvasElement */
const canvas = fireworks

let gl2 = canvas.getContext("webgl2");
globalThis.gl2 = gl2
if (!gl2) {
    throw new Error("Failed to get WebGL context!");
}


let particleShader = new G.Shader(gl2, fireworks_vs.text, fireworks_fs.text);
particleShader.use();

let particles = Array.from({length: 100}, i => Object.assign(new Particle, {
    lifetime: 5,
    startSize: 20 + 50 * Math.random(),
    startVel: G.vecPolar(Math.random() * Math.PI, 4 + 6*Math.random()),
    startColor: [
        new G.RGBA(0.95, 0.2, 0.2, 1.0),
        new G.RGBA(0.2, 0.95, 0.2, 1.0),
        new G.RGBA(0.2, 0.2, 0.95, 1.0),
        new G.RGBA(0.2, 0.95, 0.95, 1.0),
        new G.RGBA(0.95, 0.2, 0.95, 1.0),
        new G.RGBA(0.95, 0.95, 0.2, 1.0),
    ][Math.floor(Math.random()*6)],
    endColor: new G.RGBA(0.95, 0.95, 0.95, 1.0),
}))

let manyParticles = new Float32Array(particles.flatMap(p => p.asFloats()));

let particleVbo = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, particleVbo);
gl2.bufferData(gl2.ARRAY_BUFFER, manyParticles, gl2.STATIC_DRAW);

const setupAttrib = (shader, attribName, offset=0, size=1) => {
    const location = gl2.getAttribLocation(shader.program, attribName)
    gl2.enableVertexAttribArray(location);
    gl2.vertexAttribPointer(location, size, gl2.FLOAT, false,
        (new Particle).asFloats().length * 4, offset
    );
}
setupAttrib(particleShader, "lifetime");
setupAttrib(particleShader, "startPos",   4, 2);
setupAttrib(particleShader, "startVel",   4 + 4*2, 2);
setupAttrib(particleShader, "acc",        4 + 4*2 + 4*2, 2);
setupAttrib(particleShader, "startSize",  4 + 4*2 + 4*2 + 4*2);
setupAttrib(particleShader, "endSize",    4 + 4*2 + 4*2 + 4*2 + 4);
setupAttrib(particleShader, "startColor", 4 + 4*2 + 4*2 + 4*2 + 4 + 4, 4);
setupAttrib(particleShader, "endColor",   4 + 4*2 + 4*2 + 4*2 + 4 + 4 + 4*4, 4);

// the loop

gl2.clearColor(0.2, 0.15, 0.35, 1.0);
// console.log(gl2.getParameter(gl2.COLOR_CLEAR_VALUE));
let timeLoc = gl2.getUniformLocation(particleShader.program, "time");

gl2.enable(gl2.BLEND);
gl2.disable(gl2.DEPTH_TEST);
//gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);
gl2.blendFuncSeparate(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA, gl2.ONE, gl2.ONE);
gl2.blendEquationSeparate(gl2.FUNC_ADD, gl2.MAX);

function drawParticles(time) {
    // console.log("t = %.3f", time / 1000);
    
    gl2.uniform1f(timeLoc, time / 1000);
    gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
    gl2.drawArrays(gl2.POINTS, 0, particles.length);

    requestAnimationFrame(drawParticles);
}

requestAnimationFrame(drawParticles);
