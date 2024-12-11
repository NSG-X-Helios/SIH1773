<script lang="ts">
  import GlobalPanel from "$lib/components/sidepanel/GlobalPanel.svelte";
  import MeshPanel from "$lib/components/sidepanel/MeshPanel.svelte";
  import { globalState } from "$lib/state.svelte";
  let {
    gltf,
    invalidate,
    enemyGltf,
    removeOutline,
    doorGltf,
    windowGltf,
    stairGltf,
    houseGltf,
  } = $props();
</script>

<div class="w-full flex flex-col h-full border-r p-8 space-y-7">
  <h2
    class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
  >
    Blueprint to 3D Convertor
  </h2>
  {#if globalState.currentMesh}
    <MeshPanel {gltf} {invalidate} {removeOutline} />
  {:else}
    <GlobalPanel
      {gltf}
      {doorGltf}
      {windowGltf}
      {stairGltf}
      {enemyGltf}
      {houseGltf}
    />
  {/if}
</div>
