import { execSync, spawnSync } from "child_process";
import fs from "fs";

// building the convertor using pyinstaller

const buildCommand = `pyinstaller -c --onefile --collect-submodules "bpy" --collect-all "bpy" main.py`;
const workingDir = "2D-to-3D-convertor";

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

// appending target-triple and moving it to src-tauri/binaries

const extension = process.platform === "win32" ? ".exe" : "";
const destinationDir = "src-tauri/binaries";

const rustInfo = execSync("rustc -vV");
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error("Failed to determine platform target triple");
}

if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

fs.renameSync(
  `${workingDir}/dist/main${extension}`,
  `${destinationDir}/convertor-${targetTriple}${extension}`,
);

console.log(
  "Convertor successfully built, renamed with platform target-triple and moved to the src-tauri/binaries directory",
);
