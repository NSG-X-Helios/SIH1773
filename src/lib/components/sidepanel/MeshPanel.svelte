<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Slider } from "$lib/components/ui/slider";
  import { Switch } from "$lib/components/ui/switch";
  import { Button } from "$lib/components/ui/button";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import { globalState } from "$lib/state.svelte";
  let { gltf, invalidate, removeOutline } = $props();
  let color = $state(
    `#${$gltf.nodes[globalState.currentMesh].material.color.getHexString()}`,
  );
  let visibility = $state($gltf.nodes[globalState.currentMesh].visible);
  let scale = $state({
    x: [$gltf.nodes[globalState.currentMesh].scale.x],
    y: [$gltf.nodes[globalState.currentMesh].scale.y],
    z: [$gltf.nodes[globalState.currentMesh].scale.z],
  });
  let coordinates = $state({
    x: [$gltf.nodes[globalState.currentMesh].position.x],
    y: [$gltf.nodes[globalState.currentMesh].position.y],
    z: [$gltf.nodes[globalState.currentMesh].position.z],
  });
  $effect(() => {
    color = `#${$gltf.nodes[globalState.currentMesh].material.color.getHexString()}`;
  });
  $effect(() => {
    visibility = $gltf.nodes[globalState.currentMesh].visible;
  });
  $effect(() => {
    scale.x = [$gltf.nodes[globalState.currentMesh].scale.x];
    scale.y = [$gltf.nodes[globalState.currentMesh].scale.y];
    scale.z = [$gltf.nodes[globalState.currentMesh].scale.z];
  });
  $effect(() => {
    coordinates.x = [$gltf.nodes[globalState.currentMesh].position.x];
    coordinates.y = [$gltf.nodes[globalState.currentMesh].position.y];
    coordinates.z = [$gltf.nodes[globalState.currentMesh].position.z];
  });
</script>

<div class="w-full overflow-y-auto pl-3 flex-grow space-y-2">
  <Button
    variant="ghost"
    class="mb-4 p-0 h-auto font-normal"
    onclick={() => {
      removeOutline(globalState.currentMesh);
      globalState.currentMesh = undefined;
      invalidate();
    }}
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Main Menu
  </Button>
  <div class="space-y-10">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
      {globalState.currentMesh}
    </h3>
    <div class="space-y-5">
      <p class="text-xl font-semibold">Size</p>
      <div class="space-y-5 w-[95%]">
        <div class="space-y-2">
          <Label for="xScale" class="text-base font-semibold">X axis</Label>
          <Slider
            id="xScale"
            min={0}
            max={4}
            step={0.5}
            value={scale.x}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].scale.x =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
        <div class="space-y-2">
          <Label for="yScale" class="text-base font-semibold">Y axis</Label>
          <Slider
            id="yScale"
            min={0}
            max={4}
            step={0.5}
            value={scale.y}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].scale.y =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
        <div class="space-y-2">
          <Label for="zScale" class="text-base font-semibold">Z axis</Label>
          <Slider
            id="zScale"
            min={0}
            max={4}
            step={0.5}
            value={scale.z}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].scale.z =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
      </div>
    </div>

    <div class="flex w-full flex-col gap-1.5">
      <Label for="mesh-color" class="text-lg font-semibold">Color</Label>
      <Input
        type="color"
        id="mesh-color"
        bind:value={color}
        oninput={(e) => {
          const value = e.target.value;
          $gltf.nodes[globalState.currentMesh].material.color.set(
            $state.snapshot(value),
          );
          invalidate();
        }}
      />
    </div>

    <div class="flex items-center space-x-2">
      <Switch
        id="visibility"
        bind:checked={visibility}
        onCheckedChange={(checked) => {
          $gltf.nodes[globalState.currentMesh].visible =
            $state.snapshot(checked);
          invalidate();
        }}
      />
      <Label for="visibility" class="text-lg font-semibold">Visibility</Label>
    </div>
    <!-- <div class="space-y-6"> -->
    <!--   <p class="text-lg font-semibold">Shadows</p> -->
    <!--   <div class="space-y-4"> -->
    <!--     <div class="flex items-center space-x-2"> -->
    <!--       <Switch id="visibility" /> -->
    <!--       <Label for="visibility" class="text-base font-semibold">CastShadow</Label> -->
    <!--     </div> -->
    <!--     <div class="flex items-center space-x-2"> -->
    <!--       <Switch id="visibility" /> -->
    <!--       <Label for="visibility" class="text-base font-semibold" -->
    <!--         >ReceiveShadow</Label -->
    <!--       > -->
    <!--     </div> -->
    <!--   </div> -->
    <!-- </div> -->
    <div class="space-y-5">
      <p class="text-xl font-semibold">Coordinates</p>
      <div class="space-y-5 w-[95%]">
        <div class="space-y-2">
          <Label for="xCoord" class="text-base font-semibold"
            >X Coordinate</Label
          >
          <Slider
            id="xCoord"
            min={-20}
            max={20}
            step={0.5}
            value={coordinates.x}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].position.x =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
        <div class="space-y-2">
          <Label for="yCoord" class="text-base font-semibold"
            >Y Coordinate</Label
          >
          <Slider
            id="yCoord"
            min={-20}
            max={20}
            step={0.5}
            value={coordinates.y}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].position.y =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
        <div class="space-y-2">
          <Label for="zCoord" class="text-base font-semibold"
            >Z Coordinate</Label
          >
          <Slider
            id="zCoord"
            min={-20}
            max={20}
            step={0.5}
            value={coordinates.z}
            onValueCommit={(value) => {
              $gltf.nodes[globalState.currentMesh].position.z =
                $state.snapshot(value)[0];
              invalidate();
            }}
          />
        </div>
      </div>
    </div>
  </div>
</div>
