import * as G from "./minigl.mjs";
import Particle from "./Particle.mjs";

/** @type HTMLCanvasElement */
const canvas = fireworks

let gl = canvas.getContext("webgl2");
globalThis.gl2 = gl
if (!gl) {
    throw new Error("Failed to get WebGL context!");
}


let particleShader = new G.Shader(gl, fireworks_vs.text.trim(), fireworks_fs.text.trim());
particleShader.use();

const NUM_PARTICLES = 20;
let particles = Array.from({length: NUM_PARTICLES}, i =>
    Object.assign(new Particle, {
        lifetime: 5,
        timeOffset: Math.random() * 5,
        startPos: G.Vec2.polar(Math.random() * Math.PI*2, 5),
        startSize: 20 + 50 * Math.random(),
        startVel: G.Vec2.polar(Math.random() * Math.PI, 6 + 6*Math.random())
                    .add_xy(0, 20 * Math.random()),
        acc: G.vec2(2*Math.random()-1, -9.81 - 10*Math.random()),
        startColor: [
            new G.RGBA(0.95, 0.2, 0.2, 1.0),
            new G.RGBA(0.2, 0.95, 0.2, 1.0),
            new G.RGBA(0.2, 0.2, 0.95, 1.0),
            new G.RGBA(0.2, 0.95, 0.95, 1.0),
            new G.RGBA(0.95, 0.2, 0.95, 1.0),
            new G.RGBA(0.95, 0.95, 0.2, 1.0),
        ][Math.floor(Math.random()*6)],
        endColor: new G.RGBA(0.95, 0.95, 0.95, 1.0),
    })
)

let manyParticles = new Float32Array(particles.flatMap(p => p.asFloats()));

let particleVbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, particleVbo);
gl.bufferData(gl.ARRAY_BUFFER, manyParticles, gl.STATIC_DRAW);

const setupAttrib = (shader, attribName, offset=0, size=1) => {
    const location = gl.getAttribLocation(shader.program, attribName)
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false,
        (new Particle).asFloats().length * 4, offset
    );
}
setupAttrib(particleShader, "lifetime");
setupAttrib(particleShader, "timeOffset", 4);
setupAttrib(particleShader, "startPos",   4 + 4, 2);
setupAttrib(particleShader, "startVel",   4 + 4 + 4*2, 2);
setupAttrib(particleShader, "acc",        4 + 4 + 4*2 + 4*2, 2);
setupAttrib(particleShader, "startSize",  4 + 4 + 4*2 + 4*2 + 4*2);
setupAttrib(particleShader, "endSize",    4 + 4 + 4*2 + 4*2 + 4*2 + 4);
setupAttrib(particleShader, "startColor", 4 + 4 + 4*2 + 4*2 + 4*2 + 4 + 4, 4);
setupAttrib(particleShader, "endColor",   4 + 4 + 4*2 + 4*2 + 4*2 + 4 + 4 + 4*4, 4);

// the loop
const START_DELAY = 100;
let startTime = 0;

gl.clearColor(0, 0, 0, 0);
let timeLoc = gl.getUniformLocation(particleShader.program, "time");

gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function drawParticles(time) {
    gl.uniform1f(timeLoc, (time - startTime - START_DELAY) / 1000);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, particles.length);

    requestAnimationFrame(drawParticles);
}

function start() {
    startTime = document.timeline.currentTime;
    requestAnimationFrame(drawParticles);
}

addEventListener("load", start)

function stretchCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
}
stretchCanvas();
window.addEventListener("resize", stretchCanvas);