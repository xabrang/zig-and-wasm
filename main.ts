(function() {
	let memory: WebAssembly.Memory;
	const MainCanvas = document.getElementById("main_canvas")
	console.assert(MainCanvas instanceof HTMLCanvasElement, "Invalid canvas")

	const utf8Decoder = new TextDecoder('utf-8');
	function readUTF8(ptr: number, len: number): string {
		return utf8Decoder.decode(new Uint8Array(memory.buffer, ptr, len));
	}

	const wasmEnv = {
		consoleLog(messagePtr: number, length: number) {
			console.assert(memory instanceof WebAssembly.Memory, "Memory is not valid")
			console.log(readUTF8(messagePtr, length))
		}
	}

	WebAssembly.instantiateStreaming(
		fetch("/static/wasm/main.wasm"), { env: wasmEnv },
	).then(obj => {
		memory = obj.instance.exports.memory as WebAssembly.Memory
		const init = obj.instance.exports.init as VoidFunction
		init()
	})
})()

