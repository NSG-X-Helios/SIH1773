<script lang="ts">
  import { T } from "@threlte/core";
  import { XR, Controller, Hand } from "@threlte/xr";
  import { interactivity, OrbitControls } from "@threlte/extras";
  import { useDraco, useGltf } from "@threlte/extras";
  import type { DirectionalLight } from "three";
  import { globalState } from "$lib/state.svelte";
  import Building from "$lib/components/canvas/Building.svelte";
  import { LineSegments } from "three";
  let light: DirectionalLight = $state();
  interactivity();
  import { useThrelte } from "@threlte/core";
  const { invalidate: invalidateFunction } = useThrelte();
  let {
    gltf = $bindable(),
    invalidate = $bindable(),
    removeOutline = $bindable(),
  } = $props();
  const dracoLoader = useDraco("/decoders/");
  gltf = useGltf(globalState.gltfFile, { dracoLoader });
  invalidate = invalidateFunction;
  removeOutline = (wall: string) => {
    if ($gltf) {
      const edgeLines = $gltf.nodes[wall].children.find(
        (child: LineSegments) => child.name === "selection-outline",
      );
      if (edgeLines) {
        $gltf.nodes[wall].remove(edgeLines);
      }
    }
  };
</script>

<T.PerspectiveCamera
  makeDefault
  position={[20, 12, 10]}
  oncreate={(ref) => {
    ref.lookAt(1, 1, 0);
  }}
>
  <OrbitControls />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.1} />
<T.DirectionalLight position={[0, 20, 10]} castShadow bind:ref={light} />

<T.DirectionalLightHelper args={[light, 1, 0x000000]} />

<Building {gltf} {removeOutline} {invalidate} />

<XR>
  <Controller left />
  <Controller right />
  <Hand left />
  <Hand right />
</XR>
