<script lang="ts">
  import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Slider } from "$lib/components/ui/slider";
  import * as Select from "$lib/components/ui/select";
  import Box from "lucide-svelte/icons/box";
  import Upload from "lucide-svelte/icons/upload";
  import Download from "lucide-svelte/icons/download";
  import { globalState } from "$lib/state.svelte";
  import { appDataDir, resourceDir } from "@tauri-apps/api/path";
  import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";
  import { message, save } from "@tauri-apps/plugin-dialog";
  import { Command } from "@tauri-apps/plugin-shell";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import DoorImage from "$src/assets/img/door.png?enhanced";
  import WindowImage from "$src/assets/img/window.png?enhanced";
  import StairsImage from "$src/assets/img/stairs.png?enhanced";
  let { gltf, doorGltf, windowGltf, stairGltf } = $props();
  let floorTexture = $state("concrete");
  let wallTexture = $state("cookies");
  let scale = $state([0.1]);
  let wallHeight = $state(10);
  let files: FileList | undefined = $state();
  let fileUpload: HTMLInputElement;
  const triggerFileUpload = () => {
    fileUpload.click();
  };
  const validateWallHeight = () => {
    if (wallHeight === null || wallHeight === undefined) {
      wallHeight = 10;
    } else {
      wallHeight = Math.max(10, Math.min(50, +wallHeight));
    }
  };
  let renderDisabled = $state(false);
  async function downloadFile(result: ArrayBuffer) {
    const fileName = "xhelios3D.glb";
    try {
      const filePath = await save({ defaultPath: fileName });
      if (filePath) {
        await writeFile(filePath, new Uint8Array(result));
        await writeFile(filePath, new Uint8Array(result));
      }
      console.log("export done!");
      console.log("export done!");
    } catch (error) {
      console.error("Error saving file in Tauri:", error);
    }
  }
  const collectScene = () => {
    const nodes = Object.values($gltf.nodes).map((node) => node.clone());
    if ($doorGltf) {
      for (const coord of Object.values(globalState.doors)) {
        const doorClone = $doorGltf.scene.clone();
        doorClone.scale.x = 0.1;
        doorClone.scale.y = 0.1;
        doorClone.scale.z = 0.1;
        doorClone.position.x = coord.x;
        doorClone.position.y = coord.y;
        doorClone.position.z = coord.z;
        nodes.push(doorClone);
      }
    }
    if ($windowGltf) {
      for (const coord of Object.values(globalState.windows)) {
        const windowClone = $windowGltf.scene.clone();
        windowClone.scale.x = 5;
        windowClone.scale.y = 5;
        windowClone.scale.z = 5;
        windowClone.position.x = coord.x;
        windowClone.position.y = coord.y;
        windowClone.position.z = coord.z;
        nodes.push(windowClone);
      }
    }
    if ($stairGltf) {
      for (const coord of Object.values(globalState.stairs)) {
        const stairClone = $stairGltf.scene.clone();
        stairClone.scale.x = 0.1;
        stairClone.scale.y = 0.1;
        stairClone.scale.z = 0.1;
        stairClone.position.x = coord.x;
        stairClone.position.y = coord.y;
        stairClone.position.z = coord.z;
        nodes.push(stairClone);
      }
    }

    return nodes;
  };
  const downloadGLB = () => {
    if ($gltf) {
      const exporter = new GLTFExporter();
      exporter.parse(
        collectScene(),
        (result) => downloadFile(result as ArrayBuffer),
        (error) => console.log(error),
        {
          binary: true,
          includeCustomExtensions: true,
          onlyVisible: false,
        },
      );
    }
  };
  const onRender = async () => {
    if (files) {
      renderDisabled = true;
      try {
        const appDir = await appDataDir();
        const fileName = files[0].name;
        const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        const fileContent = await files[0].arrayBuffer();
        const standardizedFileName = `${appDir}/output/blueprint2D.${fileExtension}`;
        const doesOutputDirExists = await exists(`${appDir}/output/`);
        if (!doesOutputDirExists) {
          await mkdir(`${appDir}/output/`, { recursive: true });
        }
        await writeFile(standardizedFileName, new Uint8Array(fileContent));

        globalState.isGLTFUploaded = false;
        globalState.isRendering = true;
        await convertTo3D(standardizedFileName);
        const fileUrl = convertFileSrc(`${appDir}/output/model.glb`);
        console.log(fileUrl);
        globalState.gltfFile = fileUrl;
        globalState.isGLTFUploaded = true;
        globalState.isRendering = false;
        globalState.doors = {};
        globalState.windows = {};
        globalState.stairs = {};
      } catch (error) {
        console.error(
          "Error occured when saving the file on the appData directory, report it to the developer",
          error,
        );
      }
      renderDisabled = false;
    }
  };
  const convertTo3D = async (blueprintName: string) => {
    const appDir = await appDataDir();
    const resDir = (await resourceDir()) + "/resources";
    console.log(resDir);
    const outputDir = `${appDir}/output`;
    const floor = `${resDir}/floor-texture/${floorTexture}.jpg`;
    const wall = `${resDir}/wall-texture/${wallTexture}.jpg`;
    const args = [
      blueprintName,
      "--output",
      outputDir,
      "--wall_texture",
      wall,
      "--floor_texture",
      floor,
      "--scale_factor",
      String(scale[0]),
      "--wall_height",
      String(wallHeight),
    ];
    console.log(args);
    const command = Command.sidecar("binaries/convertor", args);
    const commandOutput = await command.execute();
    console.log(commandOutput);
  };
</script>

<div class="items-end flex justify-between gap-8">
  <div class="w-full space-y-2">
    <Label for="blueprint" class="text-lg font-semibold">Upload Blueprint</Label
    >
    <input
      type="file"
      id="blueprint"
      class="flex-grow border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      bind:files
      bind:this={fileUpload}
    />
  </div>
  <Button size="icon" onclick={triggerFileUpload}>
    <Upload />
  </Button>
</div>
<div class="space-y-2">
  <Label for="floor-texture-selector" class="text-lg font-semibold"
    >Floor Texture</Label
  >
  <Select.Root type="single" bind:value={floorTexture}>
    <Select.Trigger>{floorTexture}</Select.Trigger>
    <Select.Content>
      <Select.Item value="concrete" label="concrete">concrete</Select.Item>
      <Select.Item value="herringbone-pavement" label="herringbone-pavement"
        >herringbone pavement</Select.Item
      >
      <Select.Item value="laminate-floor" label="laminate-floor"
        >laminate floor</Select.Item
      >
      <Select.Item value="patterned-brick" label="patterned-brick"
        >patterned brick</Select.Item
      >
      <Select.Item value="plank-flooring" label="plank-flooring"
        >plank flooring</Select.Item
      >
    </Select.Content>
  </Select.Root>
</div>
<div class="space-y-2">
  <Label for="wall-texture-selector" class="text-lg font-semibold"
    >Wall Texture</Label
  >
  <Select.Root type="single" bind:value={wallTexture}>
    <Select.Trigger>{wallTexture}</Select.Trigger>
    <Select.Content>
      <Select.Item value="black-patterned-brick" label="black-patterned-brick"
        >black patterned brick</Select.Item
      >
      <Select.Item value="brown-brick" label="brown-brick"
        >brown brick</Select.Item
      >
      <Select.Item value="cookies" label="cookies">cookies</Select.Item>
      <Select.Item value="plank-wall" label="plank-wall">plank wall</Select.Item
      >
      <Select.Item value="synthetic-wood" label="synthetic-wood"
        >synthetic wood</Select.Item
      >
    </Select.Content>
  </Select.Root>
</div>

<div class="space-y-2">
  <Label for="scaler" class="text-lg font-semibold">Scale</Label>
  <Slider id="scaler" min={0.1} max={10} step={0.5} bind:value={scale} />
</div>
<div class="space-y-2">
  <Label for="wall-count" class="text-lg font-semibold">Height of walls</Label>
  <Input
    type="number"
    id="wall-count"
    placeholder="Enter the wall height"
    min="10"
    max="50"
    onblur={validateWallHeight}
    bind:value={wallHeight}
  />
</div>
<div class="flex w-full justify-between box-border">
  <div
    class="border border-black flex flex-col items-center p-3 rounded-3xl"
    role="button"
    onclick={() => {
      globalState.currentAsset = "doors";
    }}
    onkeyup={() => {
      globalState.currentAsset = "doors";
    }}
    tabindex={0}
  >
    <enhanced:img class="w-36 h-36 rounded-2xl" src={DoorImage} alt="" />
    <p class="text-lg font-semibold">Door</p>
  </div>
  <div
    class="border border-black flex flex-col items-center p-3 rounded-3xl"
    role="button"
    onclick={() => {
      globalState.currentAsset = "windows";
    }}
    onkeyup={() => {
      globalState.currentAsset = "windows";
    }}
    tabindex={0}
  >
    <enhanced:img class="w-36 h-36 rounded-2xl" src={WindowImage} alt="" />
    <p class="text-lg font-semibold">Window</p>
  </div>
  <div
    class="border border-black flex flex-col items-center p-3 rounded-3xl"
    role="button"
    onclick={() => {
      globalState.currentAsset = "stairs";
    }}
    onkeyup={() => {
      globalState.currentAsset = "stairs";
    }}
    tabindex={0}
  >
    <enhanced:img class="w-36 h-36 rounded-2xl" src={StairsImage} alt="" />
    <p class="text-lg font-semibold">Stairs</p>
  </div>
</div>

<Button
  onclick={onRender}
  disabled={renderDisabled}
  class="text-lg w-full font-medium"
>
  {#if globalState.isRendering}
    <!-- Loading indicator -->
    Loading...
  {:else}
    <Box size={300} /> Render to 3D
  {/if}
</Button>
<Button
  class="text-lg w-full font-medium"
  onclick={downloadGLB}
  variant="outline"
>
  <Download size={300} /> Export to 3D
</Button>
