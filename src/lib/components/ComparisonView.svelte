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

  const closeStackedView = () => {
    globalState.showStackedView = false;
  };
</script>

<!-- Stacked Model Preview Overlay -->
{#if globalState.showStackedView && globalState.stackedGltfFile}
  <div class="comparison-overlay" transition:fade={{ duration: 200 }}>
    <div class="comparison-header">
      <h2 class="title">Stacked Floors — 3D Preview</h2>
      <Button variant="ghost" size="icon" onclick={closeStackedView}>
        <X size={20} />
      </Button>
    </div>

    <div class="comparison-content">
      <div class="stacked-split">
        <!-- Left: scrollable list of per-floor blueprints -->
        <div class="panel">
          <div class="panel-header">
            <span class="label">Floor Blueprints</span>
            <span class="hint-text"
              >{globalState.blueprintPreviews.length} floor{globalState
                .blueprintPreviews.length !== 1
                ? "s"
                : ""}</span
            >
          </div>
          <div class="blueprint-list">
            {#each globalState.blueprintPreviews as src, i}
              <div class="blueprint-card">
                <div class="floor-badge">Floor {i + 1}</div>
                <div class="blueprint-card-body">
                  <img
                    {src}
                    alt="Floor {i + 1} blueprint"
                    class="blueprint-thumb"
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="divider"></div>

        <!-- Right: stacked 3D model -->
        <div class="panel model-panel-wrapper">
          <div class="panel-header">
            <span class="label"
              >Combined {globalState.floorCount}-Floor Model</span
            >
            <span class="hint-text">Auto-rotating • Drag to explore</span>
          </div>
          <div class="panel-content model-panel">
            <Canvas>
              <T.PerspectiveCamera makeDefault position={[50, 50, 50]} fov={50}>
                <OrbitControls enableDamping autoRotate autoRotateSpeed={0.8} />
              </T.PerspectiveCamera>

              <T.AmbientLight intensity={0.6} />
              <T.DirectionalLight
                position={[10, 20, 10]}
                intensity={1}
                castShadow
              />

              {#await useGltf(globalState.stackedGltfFile) then gltf}
                <T is={gltf.scene} />
              {/await}
            </Canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="comparison-footer">
      <p class="hint">
        Previewing the stacked {globalState.floorCount}-floor model. Use
        <strong>Export to 3D</strong> to save it.
      </p>
      <Button onclick={closeStackedView}>Close Preview</Button>
    </div>
  </div>
{/if}

<!-- Blueprint vs 3D Comparison Overlay -->
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

  .stacked-split {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    height: 100%;
  }

  .blueprint-list {
    flex: 1;
    min-height: 0; /* required: lets flexbox constrain the height so overflow-y works */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: hsl(var(--muted) / 0.3);
    scrollbar-width: thin;
  }

  .blueprint-card {
    display: flex;
    flex-direction: column;
    flex-shrink: 0; /* don't compress cards when list is scrollable */
    max-height: 320px; /* per-card viewport height — scroll within to see full image */
    border: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px);
    overflow: hidden;
    background: hsl(var(--card));
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  /* The image area within each card is independently scrollable */
  .blueprint-card-body {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    scrollbar-width: thin;
  }

  .floor-badge {
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: hsl(var(--primary-foreground));
    background: hsl(var(--primary));
  }

  .blueprint-thumb {
    width: 100%;
    display: block;
    object-fit: contain;
    background: white;
    padding: 0.5rem;
    /* no max-height here — full image renders inside the scrollable .blueprint-card-body */
  }

  .model-panel-wrapper {
    display: flex;
    flex-direction: column;
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
