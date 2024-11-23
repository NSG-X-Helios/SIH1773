<script lang="ts">
  import { GLTF, useDraco } from "@threlte/extras";
  const dracoLoader = useDraco("/decoders/");
</script>

<GLTF
  castShadow
  receiveShadow
  url={"/models/Floorplan-transformed.glb"}
  {dracoLoader}
/>
