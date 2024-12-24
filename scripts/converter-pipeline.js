import { spawnSync } from "child_process";
import fs from "fs";

const platform = process.platform === "win32" ? "win" : "unix";

// building the convertor using pyinstaller

const buildCommand = `pyinstaller --onedir --collect-all "bpy" --add-data "assets${platform === "win" ? ";" : ":"}assets" main.py`;
const workingDir = "2D-to-3D-converter";

const build = spawnSync(buildCommand, {
  cwd: workingDir,
  shell: true,
  stdio: "inherit",
});

if (build.error) {
  console.error("Error in building the convertor", build.error);
} else if (build.status !== 0) {
  console.error(`Build failed with exit code ${build.status}`);
} else {
  console.log("Build Successful");
}

// moving it to src-tauri/converter

const destinationDir = "src-tauri/converter";

if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

fs.renameSync(`${workingDir}/dist/main`, destinationDir);

console.log(
  "Convertor successfully built and moved to the src-tauri/converter directory",
);
