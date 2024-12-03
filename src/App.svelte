<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "$lib/components/canvas/Scene.svelte";
  import SidePanel from "$lib/components/sidepanel/SidePanel.svelte";
  import { globalState } from "$lib/state.svelte";
  import type { ThrelteGltf } from "@threlte/extras";
  import { Gizmo } from "@threlte/extras";
  import { ARButton, VRButton } from "@threlte/xr";
  import { tweened } from "svelte/motion";
  import { useProgress } from "@threlte/extras";
  import { fade } from "svelte/transition";
  let gltf: ThrelteGltf | undefined = undefined;
  let invalidate: (() => void) | undefined = undefined;
  let removeOutline: (() => void) | undefined = undefined;
  const goFullScreen = (event: KeyboardEvent) => {
    if (globalState.isGLTFUploaded && event.ctrlKey && event.key === "q") {
      event.preventDefault();
      globalState.isFullScreen = !globalState.isFullScreen;
    }
  };
  const { progress } = useProgress();
  const tweenedProgress = tweened($progress, {
    duration: 150,
  });
  $: tweenedProgress.set($progress);
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
    {#if globalState.isRendering && $tweenedProgress < 1}
      <div
        transition:fade|local={{
          duration: 200,
        }}
        class="wrapper"
      >
        <p class="loading">Loading</p>
        <div class="bar-wrapper">
          <div class="bar" style="width: {$tweenedProgress * 100}%"></div>
        </div>
      </div>
    {/if}
    {#if globalState.isGLTFUploaded}
      <Canvas>
        <Scene bind:gltf bind:invalidate bind:removeOutline />
        <Gizmo verticalPlacement={"top"} horizontalPlacement={"left"} />
      </Canvas>
      <VRButton onclick={() => (globalState.isFullScreen = true)} />
    {/if}
  </div>
</main>

<style>
  div.main {
    height: 100%;
  }
  .wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    color: black;
  }
  .loading {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .bar-wrapper {
    width: 33.333333%;
    height: 10px;
    border: 1px solid black;
    position: relative;
  }
  .bar {
    height: 100%;
    background-color: black;
  }
</style>
