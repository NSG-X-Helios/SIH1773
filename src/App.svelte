<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "$lib/components/canvas/Scene.svelte";
  import SidePanel from "$lib/components/sidepanel/SidePanel.svelte";
  import { globalState } from "$lib/state.svelte";
  import type { ThrelteGltf } from "@threlte/extras";
  import { Gizmo } from "@threlte/extras";
  import { ARButton, VRButton } from "@threlte/xr";
  let gltf: undefined | ThrelteGltf;
  let invalidate;
  let removeOutline;
  const goFullScreen = (event: KeyboardEvent) => {
    if (globalState.isGLTFUploaded && event.ctrlKey && event.key === "q") {
      event.preventDefault();
      globalState.isFullScreen = !globalState.isFullScreen;
    }
  };
</script>

<svelte:document onkeyup={goFullScreen} />
<main class="h-screen w-screen items-center justify-center flex">
  <div class="h-full w-[35%]" class:hidden={globalState.isFullScreen}>
    <SidePanel {gltf} {invalidate} {removeOutline} />
  </div>
  <div
    class="h-full flex items-center justify-center"
    class:w-full={globalState.isFullScreen}
    class:w-[65%]={!globalState.isFullScreen}
  >
    {#if globalState.isGLTFUploaded}
      <Canvas>
        <Scene bind:gltf bind:invalidate bind:removeOutline />
        <Gizmo verticalPlacement={"top"} horizontalPlacement={"left"} />
      </Canvas>
      <VRButton onclick={() => (globalState.isFullScreen = true)} />
    {/if}
  </div>
</main>
