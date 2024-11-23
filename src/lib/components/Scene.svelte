<script lang="ts">
  import { T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";
  import Building from "$lib/components/Building.svelte";
  import type { DirectionalLight } from "three";
  let light: DirectionalLight;
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

<Building />
