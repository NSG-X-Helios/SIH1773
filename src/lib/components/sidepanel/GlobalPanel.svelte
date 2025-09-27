<script lang="ts">
  import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Slider } from "$lib/components/ui/slider";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import * as Select from "$lib/components/ui/select";
  import { Switch } from "$lib/components/ui/switch";
  import Box from "lucide-svelte/icons/box";
  import Upload from "lucide-svelte/icons/upload";
  import Download from "lucide-svelte/icons/download";
  import { globalState } from "$lib/state.svelte";
  import { appDataDir, resourceDir } from "@tauri-apps/api/path";
  import { platform } from "@tauri-apps/plugin-os";
  import {
    copyFile,
    exists,
    mkdir,
    remove,
    writeFile,
  } from "@tauri-apps/plugin-fs";
  import { save, ask, message } from "@tauri-apps/plugin-dialog";
  import { Command } from "@tauri-apps/plugin-shell";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import DoorImage from "$src/assets/img/door.png?enhanced";
  import WindowImage from "$src/assets/img/window.png?enhanced";
  import StairsImage from "$src/assets/img/stairs.png?enhanced";
  import HouseImage from "$src/assets/img/house.png?enhanced";
  import HostileImage from "$src/assets/img/hostile.png?enhanced";
  import DiningImage from "$src/assets/img/dining.png?enhanced";

  let {
    gltf,
    doorGltf,
    windowGltf,
    stairGltf,
    enemyGltf,
    houseGltf,
    diningGltf,
  } = $props();

  // Mode and procedural generation state
  let blueprintMode = $state(false);
  let roofType = $state("flat");
  let proceduralHeight = $state(10);
  let proceduralWidth = $state(10);
  let proceduralBreadth = $state(10);
  let proceduralFloors = $state(1);

  const currentPlatform = platform();
  console.log(currentPlatform);
  let floorTexture = $state("laminate-floor");
  let wallTexture = $state("synthetic-wood");
  let scale = $state([0.1]);
  let wallHeight = $state(10);
  let wallThickness = $state(0);
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
  const downloadFile = async (result: ArrayBuffer) => {
    const fileName = "final.glb";
    const appDir = await appDataDir();
    try {
      const filePath = await save({ defaultPath: fileName });
      if (filePath) {
        await copyFile(`${appDir}/output/floors/final.glb`, filePath);
      }
      console.log("export done!");
      const fileUrl = convertFileSrc(`${appDir}/output/floors/final.glb`);
      console.log(fileUrl);
      globalState.gltfFile = fileUrl;
    } catch (error) {
      console.error("Error saving file in Tauri:", error);
    }
  };
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
    if ($enemyGltf) {
      for (const coord of Object.values(globalState.enemy)) {
        const enemyClone = $enemyGltf.scene.clone();
        enemyClone.scale.x = 0.15;
        enemyClone.scale.y = 0.15;
        enemyClone.scale.z = 0.15;
        enemyClone.position.x = coord.x;
        enemyClone.position.y = coord.y;
        enemyClone.position.z = coord.z;
        nodes.push(enemyClone);
      }
    }
    if ($houseGltf) {
      for (const coord of Object.values(globalState.houses)) {
        const houseClone = $houseGltf.scene.clone();
        houseClone.scale.x = 0.15;
        houseClone.scale.y = 0.15;
        houseClone.scale.z = 0.15;
        houseClone.position.x = coord.x;
        houseClone.position.y = coord.y;
        houseClone.position.z = coord.z;
        nodes.push(houseClone);
      }
    }
    if ($diningGltf) {
      for (const coord of Object.values(globalState.dining)) {
        const diningClone = $diningGltf.scene.clone();
        diningClone.scale.x = 0.2;
        diningClone.scale.y = 0.2;
        diningClone.scale.z = 0.2;
        diningClone.position.x = coord.x;
        diningClone.position.y = coord.y;
        diningClone.position.z = coord.z;
        nodes.push(diningClone);
      }
    }

    return nodes;
  };
  const downloadGLB = () => {
    if ($gltf) {
      const exporter = new GLTFExporter();
      exporter.parse(
        collectScene(),
        async (result) => {
          const appDir = await appDataDir();
          await saveFloorGLB(`${appDir}/output/floors`, result as ArrayBuffer);
          const args = [
            "--stack",
            "--output_directory",
            `${appDir}/output/floors`,
          ];

          await runConvertor(args);
          globalState.isGLTFUploaded = false;
          globalState.isRendering = true;
          await downloadFile(result as ArrayBuffer);
          globalState.isGLTFUploaded = true;
          globalState.doors = {};
          globalState.windows = {};
          globalState.houses = {};
          globalState.stairs = {};
          globalState.enemy = {};
          globalState.dining = {};
          globalState.floorCount = 1;
          files = undefined;
          fileUpload.value = "";
          globalState.isRendering = false;
        },
        (error) => console.log(error),
        {
          binary: true,
          includeCustomExtensions: true,
          onlyVisible: false,
        },
      );
    }
  };

  const runConvertor = async (flags: string[]) => {
    const cmdStr =
      ` python3 ../Le_Edificio/main.py ` +
      flags.map((f) => `'${f.replace(/'/g, `'\\''`)}'`).join(" ");
    const cmd = Command.create("exec-sh", ["-c", cmdStr], {
      env: { PYTHONUNBUFFERED: "1" },
      encoding: "utf-8",
    });
    const { stdout, stderr } = await cmd.execute();
    console.log(stderr);
    console.log(stdout);
  };

  const saveFloorGLB = async (appFloorDir: string, result: ArrayBuffer) => {
    const fileName = `floor${globalState.floorCount}.glb`;
    const filePath = `${appFloorDir}/${fileName}`;
    try {
      await writeFile(filePath, new Uint8Array(result));
      console.log(`floor ${filePath} saved!`);
    } catch (error) {
      console.error("Error saving file in the floorDirectory", error);
    }
  };

  const onRender = async () => {
    let canProceed = false;

    // Validate input based on the current mode
    if (blueprintMode) {
      // In blueprint mode, a file must be uploaded
      if (files && files.length > 0) {
        canProceed = true;
      } else {
        await message("Please upload a blueprint file.", { kind: "error" });
        return; // Stop execution if no file in blueprint mode
      }
    } else {
      // In procedural mode, for simulation, we always proceed.
      // In a real implementation, you might want to add validation
      // for proceduralHeight, Width, Breadth, and Floors here.
      canProceed = true;
    }

    if (canProceed) {
      renderDisabled = true; // Disable button during rendering
      globalState.isGLTFUploaded = false; // Hide assets while "rendering"
      globalState.isRendering = true; // Show loading animation

      console.log("Simulating floor addition...");

      // Simulate the rendering process for 20 seconds
      await new Promise((resolve) => setTimeout(resolve, 20000));

      console.log("Simulation complete!");

      // After simulation, update state to show assets and increment floor count
      // Note: globalState.gltfFile will point to a potentially non-existent file
      // if convertTo3D wasn't actually called. The viewer component should handle this.
      const appDir = await appDataDir();
      globalState.gltfFile = convertFileSrc(`${appDir}/output/furnished.glb`); // Placeholder path for viewer
      globalState.isGLTFUploaded = true; // Crucial for displaying the assets accordion
      globalState.isRendering = false; // Stop loading animation

      // Reset asset placement states for the new "floor"
      globalState.doors = {};
      globalState.windows = {};
      globalState.houses = {};
      globalState.stairs = {};
      globalState.enemy = {};
      globalState.dining = {};
      globalState.floorCount += 1; // Increment floor count
      files = undefined;
      if (fileUpload) fileUpload.value = ""; // Clear file input if it exists

      renderDisabled = false; // Re-enable the button
    }
  };

  const convertTo3D = async (blueprintName: string) => {
    const appDir = await appDataDir();
    console.log(wallTexture, floorTexture);
    const outputDir = `${appDir}/output`;
    const blueprintPath = `${outputDir}/${blueprintName}`;
    const doesOutputDirExists = await exists(`${outputDir}/${blueprintName}`);
    console.log(doesOutputDirExists);
    const args = [
      "--convert",
      `${blueprintPath}`,
      "--output_directory",
      `${outputDir}`,
      "--wall_texture",
      `${wallTexture}.jpg`,
      "--floor_texture",
      `${floorTexture}.jpg`,
      "--scale_factor",
      String(scale[0]),
      "--wall_height",
      String(wallHeight),
      "--wall_thickness",
      String(wallThickness),
    ];
    console.log(args.join(" "));
    try {
      const converterStart = performance.now();
      await runConvertor(args);
      const converterEnd = performance.now();
      console.log(
        "time took for converter execution",
        converterEnd - converterStart,
      );
    } catch (error) {
      console.error(error);
    }
  };
</script>

<div class="flex items-center space-x-2 my-4">
  <Switch id="mode-switch" bind:checked={blueprintMode} />
  <Label for="mode-switch" class="text-lg font-semibold">Blueprint Mode</Label>
</div>

{#if blueprintMode}
  <!-- BLUEPRINT MODE UI -->
  <div class="items-end flex justify-between gap-8">
    <div class="w-full space-y-2">
      <Label for="blueprint" class="text-lg font-semibold"
        >Upload Blueprint</Label
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
    <Label for="roof-type-selector-bp" class="text-lg font-semibold"
      >Roof Type</Label
    >
    <Select.Root type="single" bind:value={roofType}>
      <Select.Trigger>{roofType}</Select.Trigger>
      <Select.Content>
        <Select.Item value="flat" label="flat">flat</Select.Item>
        <Select.Item value="conical" label="conical">conical</Select.Item>
        <Select.Item value="dome" label="dome">dome</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>
{:else}
  <!-- PROCEDURAL MODE UI (DEFAULT) -->
  <div class="space-y-2">
    <Label for="roof-type-selector-proc" class="text-lg font-semibold"
      >Roof Type</Label
    >
    <Select.Root type="single" bind:value={roofType}>
      <Select.Trigger>{roofType}</Select.Trigger>
      <Select.Content>
        <Select.Item value="flat" label="flat">flat</Select.Item>
        <Select.Item value="conical" label="conical">conical</Select.Item>
        <Select.Item value="dome" label="dome">dome</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>
  <div class="space-y-2">
    <Label for="proc-height" class="text-lg font-semibold">Height</Label>
    <Input
      type="number"
      id="proc-height"
      placeholder="Enter height"
      min="1"
      bind:value={proceduralHeight}
    />
  </div>
  <div class="space-y-2">
    <Label for="proc-width" class="text-lg font-semibold">Width</Label>
    <Input
      type="number"
      id="proc-width"
      placeholder="Enter width"
      min="1"
      bind:value={proceduralWidth}
    />
  </div>
  <div class="space-y-2">
    <Label for="proc-breadth" class="text-lg font-semibold">Breadth</Label>
    <Input
      type="number"
      id="proc-breadth"
      placeholder="Enter breadth"
      min="1"
      bind:value={proceduralBreadth}
    />
  </div>
  <div class="space-y-2">
    <Label for="proc-floors" class="text-lg font-semibold">Floors</Label>
    <Input
      type="number"
      id="proc-floors"
      placeholder="Enter number of floors"
      min="1"
      bind:value={proceduralFloors}
    />
  </div>
{/if}

{#if globalState.isGLTFUploaded}
  <Accordion.Root type="single">
    <Accordion.Item value="assets">
      <Accordion.Trigger class="text-lg font-semibold">Assets</Accordion.Trigger
      >
      <Accordion.Content>
        <div class="flex w-full justify-between box-border flex-wrap gap-y-5">
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
            <enhanced:img
              class="w-28 h-28 rounded-2xl"
              src={DoorImage}
              alt=""
            />
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
            <enhanced:img
              class="w-28 h-28 rounded-2xl"
              src={WindowImage}
              alt=""
            />
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
            <enhanced:img
              class="w-28 h-28 rounded-2xl"
              src={StairsImage}
              alt=""
            />
            <p class="text-lg font-semibold">Water Tank</p>
          </div>
          <!-- The following commented-out asset blocks are left as they were in your original code -->
          <!-- <div
            class="border border-black flex flex-col items-center p-3 rounded-3xl"
            role="button"
            onclick={() => {
              globalState.currentAsset = "enemy";
            }}
            onkeyup={() => {
              globalState.currentAsset = "enemy";
            }}
            tabindex={0}
          >
            <enhanced:img class="w-28 h-28 rounded-2xl" src={HostileImage} alt="" />
            <p class="text-lg font-semibold">Hostile</p>
          </div> -->
          <!-- <div
            class="border border-black flex flex-col items-center p-3 rounded-3xl"
            role="button"
            onclick={() => {
              globalState.currentAsset = "houses";
            }}
            onkeyup={() => {
              globalState.currentAsset = "houses";
            }}
            tabindex={0}
          >
            <enhanced:img
              class="w-28 h-28 rounded-2xl"
              src={HouseImage}
              alt=""
            />
            <p class="text-lg font-semibold">House</p>
          </div> -->
          <!-- <div -->
          <!--   class="border border-black flex flex-col items-center p-3 rounded-3xl" -->
          <!--   role="button" -->
          <!--   onclick={() => { -->
          <!--     globalState.currentAsset = "dining"; -->
          <!--   }} -->
          <!--   onkeyup={() => { -->
          <!--     globalState.currentAsset = "dining"; -->
          <!--   }} -->
          <!--   tabindex={0} -->
          <!-- > -->
          <!--   <enhanced:img -->
          <!--     class="w-28 h-28 rounded-2xl" -->
          <!--     src={DiningImage} -->
          <!--     alt="" -->
          <!--   /> -->
          <!--   <p class="text-lg font-semibold">Table</p> -->
          <!-- </div> -->
        </div>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
{/if}
<Button
  onclick={onRender}
  disabled={renderDisabled}
  class="text-lg w-full font-medium"
>
  {#if globalState.isRendering}
    <!-- Loading indicator -->
    Loading...
  {:else}
    <Box size={300} /> Visualize Water Potential
  {/if}
</Button>
<Button
  class="text-lg w-full font-medium"
  onclick={downloadGLB}
  variant="outline"
>
  <Download size={300} /> Export to 3D
</Button>
