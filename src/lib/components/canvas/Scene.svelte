<script lang="ts">
  import { T } from "@threlte/core";
  import { XR, Controller, Hand } from "@threlte/xr";
  import { interactivity, OrbitControls } from "@threlte/extras";
  import { useDraco, useGltf } from "@threlte/extras";
  import type { DirectionalLight } from "three";
  import { globalState } from "$lib/state.svelte";
  import Building from "$lib/components/canvas/Building.svelte";
  import { LineSegments, PerspectiveCamera, Box3, Vector3 } from "three";
  import { useThrelte } from "@threlte/core";
  import { onMount, onDestroy } from "svelte";
  const dracoLoader = useDraco("/decoders/");

  let light: DirectionalLight | undefined = $state();
  interactivity();

  const {
    invalidate: invalidateFunction,
    camera: cameraCtx,
    scene: sceneCtx,
  } = useThrelte();

  let {
    gltf = $bindable(),
    invalidate = $bindable(),
    removeOutline = $bindable(),
    camera = $bindable(),
    scene = $bindable(),
    doorGltf = $bindable(),
    windowGltf = $bindable(),
    stairGltf = $bindable(),
  } = $props();
  gltf = useGltf(globalState.gltfFile, { dracoLoader });
  invalidate = invalidateFunction;
  camera = cameraCtx;
  scene = sceneCtx;
  doorGltf = useGltf("/models/door.glb", { dracoLoader });
  windowGltf = useGltf("/models/window.glb", { dracoLoader });
  stairGltf = useGltf("/models/stairs.glb", { dracoLoader });

  removeOutline = (wall: string) => {
    if ($gltf) {
      const edgeLines = $gltf.nodes[wall]?.children.find(
        (child: LineSegments) => child.name === "selection-outline",
      );
      if (edgeLines) {
        $gltf.nodes[wall].remove(edgeLines);
      }
    }
  };

  let perspectiveCameraRef: PerspectiveCamera | undefined = $state();
  let move = { forward: false, backward: false, left: false, right: false };
  const speed = 0.6;
  const playerBox = new Box3();

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key.toLocaleLowerCase()) {
      case "w":
        move.forward = true;
        break;
      case "s":
        move.backward = true;
        break;
      case "a":
        move.left = true;
        break;
      case "d":
        move.right = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key.toLocaleLowerCase()) {
      case "w":
        move.forward = false;
        break;
      case "s":
        move.backward = false;
        break;
      case "a":
        move.left = false;
        break;
      case "d":
        move.right = false;
        break;
    }
  };

  const checkCollision = (newPosition: Vector3): boolean => {
    if (!$gltf || !$gltf.nodes) return false;

    playerBox.setFromCenterAndSize(newPosition, new Vector3(1, 2, 1));
    for (const wall of Object.values($gltf.nodes)) {
      if ((wall as any).geometry) {
        const wallBox = new Box3().setFromObject(wall as any);
        if (playerBox.intersectsBox(wallBox)) {
          return true;
        }
      }
    }
    return false;
  };

  const animate = () => {
    let direction = new Vector3();
    if (move.forward) direction.z -= speed;
    if (move.backward) direction.z += speed;
    if (move.left) direction.x -= speed;
    if (move.right) direction.x += speed;

    if (perspectiveCameraRef) {
      const newPosition = perspectiveCameraRef.position.clone().add(direction);
      if (!checkCollision(newPosition)) {
        perspectiveCameraRef.position.copy(newPosition);
        invalidate();
      }
    }
  };

  let animationFrame: number;

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const loop = () => {
      animate();
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    cancelAnimationFrame(animationFrame);
  });
</script>

<T.PerspectiveCamera
  bind:ref={perspectiveCameraRef}
  makeDefault
  position={[20, 12, 10]}
  oncreate={(ref) => ref.lookAt(1, 1, 0)}
>
  <!-- Removed OrbitControls for manual control -->
  <OrbitControls />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.1} />
<T.DirectionalLight position={[0, 20, 10]} castShadow bind:ref={light} />

<T.DirectionalLightHelper args={[light, 1, 0x000000]} />

<Building
  {gltf}
  {removeOutline}
  {invalidate}
  {doorGltf}
  {windowGltf}
  {stairGltf}
/>

<XR>
  <Controller left />
  <Controller right />
  <Hand left />
  <Hand right />
</XR>
