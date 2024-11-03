// main.ts
var memory;
var glContext;
var MainCanvas = document.getElementById("main_canvas");
console.assert(MainCanvas instanceof HTMLCanvasElement, "Invalid canvas");
MainCanvas.width = window.innerWidth * window.devicePixelRatio;
MainCanvas.height = window.innerHeight * window.devicePixelRatio;
glContext = MainCanvas.getContext("webgl");
console.assert(glContext instanceof WebGLRenderingContext, "WEBGL not supported");
var utf8Decoder = new TextDecoder("utf-8");
function readUTF8(ptr, len) {
  return utf8Decoder.decode(new Uint8Array(memory.buffer, ptr, len));
}
var programs = [];
var shaders = [];
var buffers = [];
var wasmEnv = {
  consoleLog(messagePtr, length) {
    console.log(readUTF8(messagePtr, length));
  },
  glCreateShader(sourcePtr, sourceLen, type) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, readUTF8(sourcePtr, sourceLen));
    glContext.compileShader(shader);
    const id = shaders.length;
    shaders.push(shader);
    return id;
  },
  glCreateProgram(vertextShaderId, fragmentShaderId) {
    const program = glContext.createProgram();
    glContext.attachShader(program, shaders[vertextShaderId]);
    glContext.attachShader(program, shaders[fragmentShaderId]);
    glContext.linkProgram(program);
    var id = programs.length;
    programs.push(program);
    return id;
  },
  glGetAttribLocation(programId, keyword, keywordLen) {
    return glContext.getAttribLocation(programs[programId], readUTF8(keyword, keywordLen));
  },
  glCreateBuffer() {
    const buffer = glContext.createBuffer();
    var id = buffers.length;
    buffers.push(buffer);
    return id;
  },
  glBindBuffer(target, bufferId) {
    glContext.bindBuffer(target, buffers[bufferId]);
  },
  glBufferData(target, dataPtr, dataLen, usage) {
    const data = new Float32Array(memory.buffer, dataPtr, dataLen);
    glContext.bufferData(target, data, usage);
  },
  glClearColor(r, g, b, a) {
    glContext.clearColor(r, g, b, a);
  },
  glClear(bitmask) {
    glContext.clear(bitmask);
  },
  glUpdateViewport() {
    glContext.viewport(0, 0, MainCanvas.width, MainCanvas.height);
  },
  glUseProgram(programId) {
    glContext.useProgram(programs[programId]);
  },
  glEnableVertexAttribArray(index) {
    glContext.enableVertexAttribArray(index);
  },
  glVertexAttribPointer(index, size, type, normalized, stride, offset) {
    glContext.vertexAttribPointer(index, size, type, normalized, stride, offset);
  },
  glDrawArrays(mode, first, count) {
    glContext.drawArrays(mode, first, count);
  }
};
WebAssembly.instantiateStreaming(fetch("./static/wasm/main.wasm"), { env: wasmEnv }).then((obj) => {
  memory = obj.instance.exports.memory;
  const init = obj.instance.exports.init;
  init();
});
