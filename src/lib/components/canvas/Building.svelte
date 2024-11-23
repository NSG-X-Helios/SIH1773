<script lang="ts">
  import { T } from "@threlte/core";
  import { EdgesGeometry, LineBasicMaterial, LineSegments } from "three";
  import { globalState } from "$lib/state.svelte";
  const { gltf, removeOutline, invalidate } = $props();
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

{#if $gltf}
  {#each Object.entries($gltf.nodes) as [key, node]}
    <T is={node} ondblclick={(e) => myFunc(key, e)}></T>
  {/each}
{/if}
