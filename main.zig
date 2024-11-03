const TEST_VARIABLE = "Hello from WASM";

extern fn consoleLog([*]const u8, u8) void;

export fn init() void {
    consoleLog(TEST_VARIABLE, TEST_VARIABLE.len);
}
