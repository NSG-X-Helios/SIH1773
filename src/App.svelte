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
  import { PerfMonitor } from "@threlte/extras";
  let gltf: ThrelteGltf | undefined = undefined;
  let invalidate: (() => void) | undefined = undefined;
  let removeOutline: (() => void) | undefined = undefined;
  let camera;
  let scene;
  let doorGltf;
  let windowGltf;
  let stairGltf;
  let enemyGltf;
  let houseGltf;
  let diningGltf;
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
  import { Raycaster, Vector2 } from "three";
  const raycaster = new Raycaster();
  const mouse = new Vector2();

  const onCanvasClick = (event) => {
    event.stopPropagation();
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, $camera);
    const intersects = raycaster.intersectObjects(scene.children);
    const generateUniqueString = () => {
      const timestamp = Date.now().toString(36); // Base-36 encoding of current timestamp
      const random = Math.random().toString(36).substring(2, 10); // Random base-36 string
      return `${timestamp}-${random}`;
    };
    if (intersects.length > 0) {
      const intersection = intersects[0];
      globalState[globalState.currentAsset][generateUniqueString()] =
        intersection.point;
    }
    globalState.currentAsset = undefined;
  };
</script>

<svelte:document onkeyup={goFullScreen} />
<main class="h-screen w-screen items-center justify-center flex">
  <div class="h-full w-[35%]" class:hidden={globalState.isFullScreen}>
    <SidePanel
      {gltf}
      {invalidate}
      {removeOutline}
      {doorGltf}
      {windowGltf}
      {stairGltf}
      {enemyGltf}
      {houseGltf}
      {diningGltf}
    />
  </div>
  <div
    class="h-full flex items-center justify-center"
    class:w-full={globalState.isFullScreen}
    class:w-[65%]={!globalState.isFullScreen}
    onclick={(e) => {
      if (globalState.currentAsset) onCanvasClick(e);
    }}
    onkeyup={(e) => {
      if (globalState.currentAsset) onCanvasClick(e);
    }}
    role="button"
    tabindex="0"
  >
    {#if globalState.isRendering}
      <div
        transition:fade|local={{
          duration: 200,
        }}
        class="wrapper"
      >
        <p class="loading">Loading...</p>
        <div class="bar-wrapper">
          <div
            class="bar"
            style="width: {($tweenedProgress || 0) * 100}%;"
          ></div>
        </div>
      </div>
    {/if}
    {#if globalState.isGLTFUploaded}
      <Canvas>
        <!-- <PerfMonitor anchorX={"right"} /> -->
        <Scene
          bind:gltf
          bind:invalidate
          bind:removeOutline
          bind:camera
          bind:scene
          bind:doorGltf
          bind:windowGltf
          bind:stairGltf
          bind:enemyGltf
          bind:houseGltf
          bind:diningGltf
        />
        <Gizmo verticalPlacement={"top"} horizontalPlacement={"left"} />
      </Canvas>
      <VRButton onclick={() => (globalState.isFullScreen = true)} />
    {/if}
  </div>
</main>

<style>
  .wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    color: black;
  }
  .loading {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    animation: pulse 1.5s infinite;
  }
  .bar-wrapper {
    width: 50%;
    height: 12px;
    border: 1px solid #333;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    position: relative;
  }

  .bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(2, 0, 36, 0) 0%,
      #000000 50%,
      rgba(2, 0, 36, 0) 100%
    );
    background-size: 200% 100%;
    animation: loading 2s infinite linear;
    transition: width 0.15s ease-in-out;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
