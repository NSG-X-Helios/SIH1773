<script lang="ts">
  import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Slider } from "$lib/components/ui/slider";
  import * as Select from "$lib/components/ui/select";
  import { Box, Upload, Download } from "lucide-svelte";
  import { globalState } from "$lib/state.svelte";
  import { writeFile } from "@tauri-apps/plugin-fs";
  import { save } from "@tauri-apps/plugin-dialog";
  let { gltf, invalidate } = $props();
  let texture = $state("brick");
  let scale = $state([1]);
  let wallHeight = $state(3);
  let files = $state();
  let fileUpload: HTMLInputElement;
  const triggerFileUpload = () => {
    fileUpload.click();
  };
  async function downloadFile(result) {
    const fileName = "xhelios3D.glb";
    if (window.__TAURI__) {
      // Tauri: Use file system APIs
      try {
        const filePath = await save({ defaultPath: fileName });
        if (filePath) {
          await writeFile(fileName, new Uint8Array(result));
          alert(`File saved to ${filePath}`);
        }
      } catch (error) {
        console.error("Error saving file in Tauri:", error);
      }
    } else {
      // Browser: Use URL.createObjectURL
      try {
        const link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        link.href = URL.createObjectURL(
          new Blob([result], { type: "application/octet-stream" }),
        );
        link.download = fileName;
        link.click();
        document.body.removeChild(link); // Clean up
      } catch (error) {
        console.error("Error downloading file in browser:", error);
      }
    }
  }
  const downloadGLB = () => {
    if ($gltf) {
      const exporter = new GLTFExporter();
      exporter.parse(
        Object.values($gltf.nodes).map((node) => node.clone()),
        downloadFile,
        (error) => console.log(error),
        {
          binary: true,
          includeCustomExtensions: true,
          onlyVisible: false,
        },
      );
    }
  };
</script>

<div class="items-end flex justify-between gap-8">
  <div class="w-full">
    <Label for="blueprint" class="text-lg font-semibold">Upload Blueprint</Label
    >
    <input
      type="file"
      id="blueprint"
      class="flex-grow border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      bind:this={fileUpload}
      bind:files
    />
  </div>
  <Button size="icon" onclick={triggerFileUpload}>
    <Upload />
  </Button>
</div>
<div>
  <Label for="texture-selector" class="text-lg font-semibold">Texture</Label>
  <Select.Root type="single" bind:value={texture}>
    <Select.Trigger>{texture}</Select.Trigger>
    <Select.Content>
      <Select.Item value="concrete" label="concrete">concrete</Select.Item>
      <Select.Item value="brick" label="brick">brick</Select.Item>
      <Select.Item value="wood" label="wood">wood</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
<div>
  <Label for="scaler" class="text-lg font-semibold">Scale</Label>
  <Slider id="scaler" min={0.5} max={2} step={0.1} bind:value={scale} />
</div>
<div>
  <Label for="wall-count" class="text-lg font-semibold">Height of walls</Label>
  <Input
    type="number"
    id="wall-count"
    placeholder="Enter the wall height"
    min="0"
    bind:value={wallHeight}
  />
</div>
<Button
  onclick={() => {
    globalState.isGLTFUploaded = true;
  }}
  class="text-lg w-full font-medium"
>
  <Box size={300} /> Render to 3D
</Button>
<Button
  class="text-lg w-full font-medium"
  onclick={downloadGLB}
  variant="outline"
>
  <Download size={300} /> Export to 3D
</Button>
