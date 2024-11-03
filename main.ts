let memory: WebAssembly.Memory
let glContext: WebGLRenderingContext | null

const MainCanvas = document.getElementById("main_canvas") as HTMLCanvasElement | null
console.assert(MainCanvas instanceof HTMLCanvasElement, "Invalid canvas")

MainCanvas!.width = window.innerWidth * window.devicePixelRatio
MainCanvas!.height = window.innerHeight * window.devicePixelRatio

glContext = MainCanvas!.getContext("webgl")
console.assert(glContext instanceof WebGLRenderingContext, "WEBGL not supported")

const utf8Decoder = new TextDecoder('utf-8')
function readUTF8(ptr: number, len: number): string {
	return utf8Decoder.decode(new Uint8Array(memory.buffer, ptr, len))
}

var programs: WebGLProgram[] = [];
var shaders: WebGLShader[] = [];
var buffers: WebGLBuffer[] = []

const wasmEnv = {
	consoleLog(messagePtr: number, length: number) {
		console.log(readUTF8(messagePtr, length))
	},
	glCreateShader(sourcePtr: number, sourceLen: number, type: number): number {
		const shader = glContext!.createShader(type)
		glContext!.shaderSource(shader!, readUTF8(sourcePtr, sourceLen))
		glContext!.compileShader(shader!)

		const id = shaders.length
		shaders.push(shader!)

		return id // return shader_id (index from shaders)
	},
	glCreateProgram(vertextShaderId: number, fragmentShaderId: number): number {

		const program = glContext!.createProgram()
		glContext!.attachShader(program!, shaders[vertextShaderId])
		glContext!.attachShader(program!, shaders[fragmentShaderId])
		glContext!.linkProgram(program!)

		var id = programs.length
		programs.push(program!)

		return id // return index from programs
	},
	glGetAttribLocation(programId: number, keyword: number, keywordLen: number): number {
		return glContext!.getAttribLocation(programs[programId], readUTF8(keyword, keywordLen));
	},
	glCreateBuffer(): number {
		const buffer = glContext!.createBuffer()
		var id = buffers.length
		buffers.push(buffer!)
		return id
	},
	glBindBuffer(target: number, bufferId: number) {
		glContext!.bindBuffer(target, buffers[bufferId])
	},
	glBufferData(target: number, dataPtr: number, dataLen: number, usage: number) {
		const data = new Float32Array(memory.buffer, dataPtr, dataLen)
		glContext!.bufferData(target, data, usage)
	},
	glClearColor(r: number, g: number, b: number, a: number) {
		glContext!.clearColor(r, g, b, a)
	},
	glClear(bitmask: number) {
		glContext!.clear(bitmask)
	},
	glUpdateViewport(): void {
		glContext!.viewport(0, 0, MainCanvas!.width, MainCanvas!.height)
	},
	glUseProgram(programId: number): void {
		glContext!.useProgram(programs[programId])
	},
	glEnableVertexAttribArray(index: number): void {
		glContext!.enableVertexAttribArray(index)
	},
	glVertexAttribPointer(index: GLuint, size: GLint, type: GLenum, normalized: GLboolean, stride: GLsizei, offset: GLintptr) {
		glContext!.vertexAttribPointer(index, size, type, normalized, stride, offset)
	},
	glDrawArrays(mode: GLenum, first: GLint, count: GLsizei) {
		glContext!.drawArrays(mode, first, count)
	}
}

WebAssembly.instantiateStreaming(
	fetch("./static/wasm/main.wasm"), { env: wasmEnv },
).then(obj => {
	memory = obj.instance.exports.memory as WebAssembly.Memory
	const init = obj.instance.exports.init as VoidFunction
	init()
})
