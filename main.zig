const GL_COLOR_BUFFER_BIT = 16384;
const GL_VERTEX_SHADER = 0x8B31;
const GL_FRAGMENT_SHADER = 0x8B30;
const GL_ARRAY_BUFFER = 0x8892;
const GL_STATIC_DRAW = 35044;
const GL_FLOAT = 5126;
const GL_TRIANGLES = 4;

const vs =
    \\ 
    \\  // an attribute will receive data from a buffer
    \\  attribute vec4 a_position;
    \\ 
    \\  // all shaders have a main function
    \\  void main() {
    \\ 
    \\    // gl_Position is a special variable a vertex shader
    \\    // is responsible for setting
    \\    gl_Position = a_position;
    \\  }
;

const fs =
    \\ 
    \\  // fragment shaders don't have a default precision so we need
    \\  // to pick one. mediump is a good default
    \\  precision mediump float;
    \\ 
    \\  void main() {
    \\    // gl_FragColor is a special variable a fragment shader
    \\    // is responsible for setting
    \\    gl_FragColor = vec4(1, 1, 0.2, 1); // return reddish-purple
    \\  }
;

const positions = [_]f32{
    0,   0,
    0,   0.5,
    0.5, 0,
};

extern fn consoleLog([*]u8, u8) void;
extern fn glClearColor(f32, f32, f32, f32) void;
extern fn glClear(f32) void;
extern fn glCreateProgram(i32, i32) i32;
extern fn glCreateShader([*]u8, i32, i32) i32;
extern fn glGetAttribLocation(i32, [*]u8, i32) i32;
extern fn glCreateBuffer() i32;
extern fn glBindBuffer(i32, i32) void;
extern fn glBufferData(i32, *const f32, i32, i32) void;
extern fn glUpdateViewport() void;
extern fn glUseProgram(i32) void;
extern fn glEnableVertexAttribArray(i32) void;
extern fn glVertexAttribPointer(i32, i32, i32, bool, i32, i32) void;
extern fn glDrawArrays(i32, i32, i32) void;

export fn init() void {
    consoleLog(@constCast("Wasm start"), 10);
    setupWebGL();
}

fn setupWebGL() void {
    const vertexShaderId = glCreateShader(@constCast(vs), vs.len, GL_VERTEX_SHADER);
    const fragmentShaderId = glCreateShader(@constCast(fs), fs.len, GL_FRAGMENT_SHADER);
    const programId = glCreateProgram(vertexShaderId, fragmentShaderId);

    const positionAttributeLocation = glGetAttribLocation(programId, @constCast("a_position"), 10);

    const positionBufferId = glCreateBuffer();
    glBindBuffer(GL_ARRAY_BUFFER, positionBufferId);

    glBufferData(GL_ARRAY_BUFFER, &positions[0], positions.len, GL_STATIC_DRAW);

    glUpdateViewport();
    glClearColor(0.2, 0.2, 0.2, 1);
    glClear(GL_COLOR_BUFFER_BIT);

    glUseProgram(programId);

    glEnableVertexAttribArray(positionAttributeLocation);
    glBindBuffer(GL_ARRAY_BUFFER, positionBufferId);

    glVertexAttribPointer(positionBufferId, 2, GL_FLOAT, false, 0, 0);

    glDrawArrays(GL_TRIANGLES, 0, 3);
}
