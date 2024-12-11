<script lang="ts">
  import { T } from "@threlte/core";
  import { EdgesGeometry, LineBasicMaterial, LineSegments } from "three";
  import Door from "$lib/components/models/Door.svelte";
  import Window from "$lib/components/models/Window.svelte";
  import Stairs from "$lib/components/models/Stairs.svelte";
  import { globalState } from "$lib/state.svelte";
  import Enemy from "$lib/components/models/Enemy.svelte";
  import House from "$lib/components/models/House.svelte";
  import Dining from "$lib/components/models/Dining.svelte";

  const {
    gltf,
    removeOutline,
    invalidate,
    doorGltf,
    windowGltf,
    stairGltf,
    enemyGltf,
    houseGltf,
    diningGltf,
  } = $props();
  const lineMaterial = new LineBasicMaterial({
    color: 0xffff00,
    linewidth: 5,
  });
  const myFunc = (wall: string, e: MouseEvent) => {
    e.stopPropagation();
    if ($gltf) {
      if (globalState.currentMesh) {
        removeOutline(globalState.currentMesh);
      }
      $gltf.nodes[wall].material = $gltf.nodes[wall].material.clone();
      const edges = new EdgesGeometry($gltf.nodes[wall].geometry);
      const edgeLines = new LineSegments(edges, lineMaterial);
      edgeLines.name = "selection-outline";
      $gltf.nodes[wall].add(edgeLines);
      globalState.currentMesh = wall;
      invalidate();
    }
  };
</script>

{#if $stairGltf}
  {#each Object.keys(globalState.stairs) as id (id)}
    <Stairs {id} {stairGltf} />
  {/each}
{/if}
{#if $doorGltf}
  {#each Object.keys(globalState.doors) as id (id)}
    <Door {id} {doorGltf} />
  {/each}
{/if}
{#if $windowGltf}
  {#each Object.keys(globalState.windows) as id (id)}
    <Window {id} {windowGltf} />
  {/each}
{/if}
{#if $enemyGltf}
  {#each Object.keys(globalState.enemy) as id (id)}
    <Enemy {id} {enemyGltf} />
  {/each}
{/if}
{#if $houseGltf}
  {#each Object.keys(globalState.houses) as id (id)}
    <House {id} {houseGltf} />
  {/each}
{/if}
{#if $diningGltf}
  {#each Object.keys(globalState.dining) as id (id)}
    <Dining {id} {diningGltf} />
  {/each}
{/if}

{#if $gltf}
  <T.Group>
    {#each Object.entries($gltf.nodes) as [key, node]}
      <T is={node} ondblclick={(e: MouseEvent) => myFunc(key, e)}></T>
    {/each}
  </T.Group>
{/if}
