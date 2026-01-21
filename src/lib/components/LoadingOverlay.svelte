<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  // Simulated progress stages based on typical conversion workflow
  const stages = [
    { progress: 8, message: "Initializing converter" },
    { progress: 18, message: "Analyzing blueprint" },
    { progress: 30, message: "Detecting room boundaries" },
    { progress: 42, message: "Identifying walls" },
    { progress: 55, message: "Generating 3D geometry" },
    { progress: 68, message: "Applying textures" },
    { progress: 80, message: "Optimizing mesh" },
    { progress: 92, message: "Compressing model" },
    { progress: 98, message: "Finalizing" },
  ];

  let progress = $state(0);
  let currentMessage = $state("Preparing...");
  let startTime = $state(0);
  let estimatedTime = $state("Calculating...");
  let currentStage = $state(0);
  let progressInterval: ReturnType<typeof setInterval>;

  // Spinner rotation
  let spinnerRotation = $state(0);
  let spinnerInterval: ReturnType<typeof setInterval>;

  const updateProgress = () => {
    if (currentStage >= stages.length) {
      progress = 99;
      currentMessage = "Almost there...";
      return;
    }

    const stage = stages[currentStage];
    const targetProgress = stage.progress;
    const step = Math.max(0.5, (targetProgress - progress) / 15);

    if (progress < targetProgress - 0.5) {
      progress = Math.min(progress + step, targetProgress);
    } else {
      currentMessage = stages[currentStage].message;
      currentStage++;
    }

    // Update ETA
    const elapsed = Date.now() - startTime;
    const progressRatio = progress / 100;
    if (progressRatio > 0.08) {
      const totalTime = elapsed / progressRatio;
      const remaining = Math.max(0, totalTime - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      if (seconds > 60) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        estimatedTime = `~${minutes}m ${secs}s`;
      } else if (seconds > 0) {
        estimatedTime = `~${seconds}s`;
      } else {
        estimatedTime = "Almost done";
      }
    }
  };

  onMount(() => {
    startTime = Date.now();
    currentMessage = stages[0].message;

    // Progress simulation interval
    progressInterval = setInterval(updateProgress, 200);

    // Spinner animation
    spinnerInterval = setInterval(() => {
      spinnerRotation = (spinnerRotation + 6) % 360;
    }, 20);
  });

  onDestroy(() => {
    if (progressInterval) clearInterval(progressInterval);
    if (spinnerInterval) clearInterval(spinnerInterval);
  });
</script>

<div class="overlay" transition:fade|local={{ duration: 200 }}>
  <div class="content">
    <!-- Minimal spinner -->
    <div class="spinner-container">
      <svg
        class="spinner"
        viewBox="0 0 50 50"
        style="transform: rotate({spinnerRotation}deg)"
      >
        <circle
          class="spinner-track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
        />
        <circle
          class="spinner-fill"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
          stroke-dasharray="31.4 94.2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- Status text -->
    <div class="status">
      <p class="message">{currentMessage}</p>
    </div>

    <!-- Progress bar -->
    <div class="progress-wrapper">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <div class="progress-info">
        <span class="percentage">{Math.round(progress)}%</span>
        <span class="eta">{estimatedTime}</span>
      </div>
    </div>

    <!-- Subtle hint -->
    <p class="hint">Converting blueprint to 3D model...</p>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: hsl(var(--background));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2.5rem;
    max-width: 360px;
    width: 100%;
  }

  /* Spinner */
  .spinner-container {
    width: 48px;
    height: 48px;
  }

  .spinner {
    width: 100%;
    height: 100%;
  }

  .spinner-track {
    stroke: hsl(var(--muted));
  }

  .spinner-fill {
    stroke: hsl(var(--foreground));
  }

  /* Status */
  .status {
    text-align: center;
  }

  .message {
    font-size: 1rem;
    font-weight: 500;
    color: hsl(var(--foreground));
    margin: 0;
  }

  /* Progress bar */
  .progress-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: hsl(var(--muted));
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: hsl(var(--foreground));
    border-radius: 3px;
    transition: width 0.2s ease-out;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
  }

  .percentage {
    color: hsl(var(--foreground));
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .eta {
    color: hsl(var(--muted-foreground));
  }

  /* Hint */
  .hint {
    font-size: 0.8rem;
    color: hsl(var(--muted-foreground));
    margin: 0;
    margin-top: 0.5rem;
  }
</style>
