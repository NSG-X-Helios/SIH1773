<script lang="ts">
  import { globalState } from "$lib/state.svelte";
  import X from "lucide-svelte/icons/x";
  import { Button } from "$lib/components/ui/button";
  import { fade } from "svelte/transition";
  import { Canvas } from "@threlte/core";
  import { useGltf, OrbitControls } from "@threlte/extras";
  import { T } from "@threlte/core";
  import * as THREE from "three";

  const closeComparison = () => {
    globalState.showComparison = false;
  };
</script>

<!-- Inline 3D Preview Scene Component -->
{#snippet PreviewScene()}
  <T.PerspectiveCamera makeDefault position={[30, 30, 30]} fov={50}>
    <OrbitControls enableDamping autoRotate autoRotateSpeed={1} />
  </T.PerspectiveCamera>

  <T.AmbientLight intensity={0.6} />
  <T.DirectionalLight position={[10, 20, 10]} intensity={1} castShadow />

  {#if globalState.gltfFile}
    {#await useGltf(globalState.gltfFile) then gltf}
      <T is={gltf.scene} />
    {/await}
  {/if}
{/snippet}

{#if globalState.showComparison && globalState.blueprintPreview}
  <div class="comparison-overlay" transition:fade={{ duration: 200 }}>
    <div class="comparison-header">
      <h2 class="title">Blueprint vs 3D Model</h2>
      <Button variant="ghost" size="icon" onclick={closeComparison}>
        <X size={20} />
      </Button>
    </div>

    <div class="comparison-content">
      <!-- Side by Side View -->
      <div class="side-by-side">
        <div class="panel">
          <div class="panel-header">
            <span class="label">Original Blueprint</span>
          </div>
          <div class="panel-content">
            <img
              src={globalState.blueprintPreview}
              alt="Original 2D Blueprint"
              class="preview-image"
            />
          </div>
        </div>

        <div class="divider"></div>

        <div class="panel">
          <div class="panel-header">
            <span class="label">3D Model Preview</span>
            <span class="hint-text">Auto-rotating • Drag to explore</span>
          </div>
          <div class="panel-content model-panel">
            <Canvas>
              <T.PerspectiveCamera makeDefault position={[30, 30, 30]} fov={50}>
                <OrbitControls enableDamping autoRotate autoRotateSpeed={1} />
              </T.PerspectiveCamera>

              <T.AmbientLight intensity={0.6} />
              <T.DirectionalLight position={[10, 20, 10]} intensity={1} />

              {#if globalState.gltfFile}
                {#await useGltf(globalState.gltfFile) then gltf}
                  <T is={gltf.scene} />
                {/await}
              {/if}
            </Canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="comparison-footer">
      <p class="hint">
        Compare the original blueprint with the generated 3D model
      </p>
      <Button onclick={closeComparison}>Close Comparison</Button>
    </div>
  </div>
{/if}

<style>
  .comparison-overlay {
    position: fixed;
    inset: 0;
    background: hsl(var(--background));
    z-index: 900;
    display: flex;
    flex-direction: column;
  }

  .comparison-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid hsl(var(--border));
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .comparison-content {
    flex: 1;
    padding: 1.5rem;
    overflow: hidden;
  }

  .side-by-side {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    height: 100%;
  }

  .panel {
    display: flex;
    flex-direction: column;
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    overflow: hidden;
    background: hsl(var(--card));
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid hsl(var(--border));
    background: hsl(var(--muted));
  }

  .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  .hint-text {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
  }

  .panel-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow: auto;
    background: hsl(var(--muted) / 0.3);
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: calc(var(--radius) - 4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .divider {
    width: 1px;
    background: hsl(var(--border));
    align-self: stretch;
  }

  .model-panel {
    padding: 0;
    position: relative;
  }

  .comparison-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid hsl(var(--border));
    background: hsl(var(--muted) / 0.5);
  }

  .hint {
    margin: 0;
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
  }
</style>
