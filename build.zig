const std = @import("std");

pub fn build(b: *std.Build) void {
    const exe = b.addExecutable(.{
        .name = "main",
        .root_source_file = b.path("main.zig"),
        .target = b.resolveTargetQuery(.{
            .os_tag = .freestanding,
            .cpu_arch = .wasm32,
        }),
        .optimize = .ReleaseSmall,
    });

    exe.entry = .disabled;
    exe.rdynamic = true;

    const wf = b.addWriteFiles();
    const app_exe_name = b.fmt("project/{s}", .{exe.out_filename});
    const copy_file_path = wf.addCopyFile(exe.getEmittedBin(), app_exe_name);

    const install_tar = b.addInstallFileWithDir(
        copy_file_path,
        .{ .custom = "../static/wasm" },
        exe.out_filename,
    );

    b.getInstallStep().dependOn(&install_tar.step);
}
