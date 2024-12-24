import { NodeIO } from "@gltf-transform/core";
import {
  dedup,
  resample,
  prune,
  textureCompress,
  draco,
} from "@gltf-transform/functions";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Get the file name from command-line arguments.
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("pass a GLB file");
  process.exit(1);
}

const fileName = args[0];
const inputDir = path.join("public", "models");
const filePath = path.join(inputDir, fileName);
const outputDir = inputDir;
const outputFileName = fileName.replace(".glb", "-compressed.glb");
const outputPath = path.join(outputDir, outputFileName);

// Check if input file exists.
if (!fs.existsSync(filePath)) {
  console.error(`Error: File "${filePath}" not found.`);
  process.exit(1);
}

// Initialize NodeIO with Draco and extensions.
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const resolution = 1024;

try {
  // Read the input file.
  const document = await io.read(filePath);

  // Define the transformation functions.
  const functions = [
    resample(), // Losslessly resample animation frames.
    dedup(), // Remove duplicate vertex or texture data.
    prune(), // Remove unused nodes, textures, or other data.
    textureCompress({
      targetFormat: "jpeg",
      encoder: sharp,
      resize: [resolution, resolution], // Resize textures.
    }),
    draco(), // Add Draco compression.
  ];

  // Apply the transformations.
  await document.transform(...functions);

  // Write the output file.
  await io.write(outputPath, document);

  console.log(`Compressed file written to: ${outputPath}`);
} catch (error) {
  console.error("Error processing the file:", error);
}
