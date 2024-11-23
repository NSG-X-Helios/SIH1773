<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "$lib/components/Scene.svelte";
  import Modifiers from "$lib/components/Modifiers.svelte";
</script>

<main class="h-screen w-screen items-center justify-center flex">
  <div class="h-full w-[35%]">
    <Modifiers />
  </div>
  <div class="h-full w-[65%] flex items-center justify-center">
    <Canvas>
      <Scene />
    </Canvas>
  </div>
</main>
