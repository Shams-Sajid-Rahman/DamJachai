import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { BloodDrop, COLORS, Microscope, PriceOrb, TestTube, useTagGeometry } from './objects.jsx';

const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);

/**
 * Each object has a position per story stage:
 *   stage 0 = hero (scattered around the headline)
 *   stage 1 = "same test, different price" (two orbs: a small cheap one and a big expensive one)
 *   stage 2 = Search, Compare, Save (objects gather into three groups)
 */
const FULL_LAYOUT = [
  { kind: 'tube', liquid: COLORS.teal, s0: [-4.2, 1.2, -1], s1: [-5.6, 2.4, -3], s2: [-5.2, 2.4, -2], rot: [0.2, 0, 0.35], scale: 1 },
  { kind: 'tube', liquid: COLORS.coral, s0: [-2.9, -1.9, 0.2], s1: [-5.2, -2.8, -2], s2: [-4.6, -3.1, -1], rot: [-0.1, 0, -0.25], scale: 0.85 },
  { kind: 'tube', liquid: COLORS.tealLight, s0: [4.4, -1.2, -1.5], s1: [5.8, -2.6, -3], s2: [5.2, -2.9, -2], rot: [0.1, 0, 0.5], scale: 0.9 },
  { kind: 'drop', s0: [3.3, 1.9, 0], s1: [5.2, 2.8, -2], s2: [4.8, 2.6, -1.5], rot: [0, 0, 0.2], scale: 0.75 },
  { kind: 'microscope', s0: [4.6, 1.4, -3.2], s1: [6.8, 0.2, -5], s2: [0, -3.7, -2.5], rot: [0.1, -0.6, 0], scale: 0.9 },
  // In stage 1 the two "hero" orbs sit above the content: a small cheap one (teal) and a big expensive one (coral).
  { kind: 'orb', color: COLORS.teal, s0: [-1.6, 2.5, -2], s1: [-1.3, 2.9, -1.5], s2: [-2.3, 3.0, -2], scale: 1, scale1: 0.75, hero: true },
  { kind: 'orb', color: COLORS.coral, s0: [1.9, -2.4, -1.4], s1: [1.5, 2.6, -1.5], s2: [2.3, 3.0, -2], scale: 1, scale1: 1.7, hero: true },
  { kind: 'orb', color: COLORS.tealLight, s0: [-5.2, -0.4, -3], s1: [-8, -3.6, -6], s2: [0, 3.4, -3], scale: 0.7 },
  { kind: 'orb', color: COLORS.teal, s0: [0.6, 3.1, -4], s1: [1, 4.4, -6], s2: [-1.9, -3.5, -2], scale: 0.6 },
];

// The lite layout keeps fewer objects and pushes them to the top and bottom of narrow screens.
const LITE_LAYOUT = [
  { kind: 'tube', liquid: COLORS.teal, s0: [-1.8, 2.9, -2], s1: [-3, 4, -4], s2: [-1.6, 2.6, -2], rot: [0.2, 0, 0.4], scale: 0.8 },
  { kind: 'drop', s0: [1.9, -3, -1], s1: [3, -4, -3], s2: [0, -2.7, -1.5], rot: [0, 0, 0.2], scale: 0.6 },
  { kind: 'orb', color: COLORS.teal, s0: [1.8, 3.1, -2], s1: [-1.1, 0.2, 0.5], s2: [1.7, 2.7, -2], scale: 0.8, scale1: 0.6, hero: true },
  { kind: 'orb', color: COLORS.coral, s0: [-1.7, -3.2, -2], s1: [1.2, 0.2, 0.2], s2: [-1.6, -2.7, -2], scale: 0.8, scale1: 1.4, hero: true },
];

function SceneObject({ item, index, progressRef, pointerRef, animate, tagGeometry }) {
  const ref = useRef(null);
  const phase = index * 1.37;
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const p = animate ? progressRef.current : 0;
    const w1 = smooth(0.12, 0.42, p) * (1 - smooth(0.62, 0.88, p)); // weight of stage 1
    const w2 = smooth(0.62, 0.92, p); // weight of stage 2
    const w0 = 1 - w1 - w2;

    target.set(
      item.s0[0] * w0 + item.s1[0] * w1 + item.s2[0] * w2,
      item.s0[1] * w0 + item.s1[1] * w1 + item.s2[1] * w2,
      item.s0[2] * w0 + item.s1[2] * w1 + item.s2[2] * w2,
    );

    const t = state.clock.elapsedTime;
    if (animate) {
      target.y += Math.sin(t * 0.8 + phase) * 0.15; // gentle floating
      target.x += pointerRef.current.x * 0.12 * (1 + (index % 3) * 0.3); // a little parallax
    }

    const k = animate ? 1 - Math.exp(-delta * 4) : 1; // frame-rate independent easing
    g.position.lerp(target, k);

    const scale = (item.scale ?? 1) * (item.hero ? lerp(1, item.scale1 ?? 1, w1) : 1);
    g.scale.setScalar(lerp(g.scale.x || scale, scale, k));

    if (animate) {
      g.rotation.y += delta * (item.kind === 'orb' ? 0.6 : 0.25);
      g.rotation.x = (item.rot?.[0] ?? 0) + Math.sin(t * 0.5 + phase) * 0.08;
    }
  });

  const rotation = item.rot ?? [0, 0, 0];
  let child = null;
  if (item.kind === 'tube') child = <TestTube liquid={item.liquid} />;
  if (item.kind === 'drop') child = <BloodDrop />;
  if (item.kind === 'microscope') child = <Microscope />;
  if (item.kind === 'orb') child = <PriceOrb color={item.color} tagGeometry={tagGeometry} />;

  return (
    <group ref={ref} position={item.s0} rotation={rotation} scale={item.scale ?? 1}>
      {child}
    </group>
  );
}

/** Moves the camera through the scene as the story scrolls, and tilts the whole scene toward the pointer. */
function CameraRig({ progressRef, pointerRef, animate, groupRef }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    const p = animate ? progressRef.current : 0;
    const k = animate ? 1 - Math.exp(-delta * 3) : 1;
    camera.position.z = lerp(camera.position.z, 9 - p * 2.2, k);
    camera.position.y = lerp(camera.position.y, -p * 0.6, k);
    camera.lookAt(0, -p * 0.4, 0);
    if (groupRef.current && animate) {
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, pointerRef.current.x * 0.18, k);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, pointerRef.current.y * 0.1, k);
    }
  });
  return null;
}

function Scene({ tier, animate, progressRef, pointerRef }) {
  const groupRef = useRef(null);
  const tagGeometry = useTagGeometry();
  const layout = tier === 'full' ? FULL_LAYOUT : LITE_LAYOUT;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-5, 2, 3]} intensity={30} color={COLORS.teal} distance={20} />
      <pointLight position={[5, -3, 2]} intensity={25} color={COLORS.coral} distance={18} />
      <group ref={groupRef}>
        {layout.map((item, i) => (
          <SceneObject
            key={i}
            item={item}
            index={i}
            progressRef={progressRef}
            pointerRef={pointerRef}
            animate={animate}
            tagGeometry={tagGeometry}
          />
        ))}
      </group>
      {tier === 'full' && animate && <Sparkles count={70} scale={[14, 8, 6]} size={2.2} speed={0.25} color={COLORS.tealLight} opacity={0.6} />}
      <CameraRig progressRef={progressRef} pointerRef={pointerRef} animate={animate} groupRef={groupRef} />
    </>
  );
}

/**
 * The full-screen hero canvas.
 * - The pixel ratio is capped (1.75 full, 1.25 lite) and drops to 1 if the frame rate falls (PerformanceMonitor).
 * - `paused` stops the render loop when the story is off screen or the tab is hidden.
 * - With reduced motion, one static frame is rendered on demand and nothing moves.
 * - The canvas has no text content. All SEO text lives in the HTML around it.
 */
export default function HeroScene({ tier, reducedMotion, paused, progressRef, pointerRef, onReady }) {
  const maxDpr = tier === 'full' ? 1.75 : 1.25;
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, maxDpr));
  const animate = !reducedMotion;

  return (
    <Canvas
      dpr={dpr}
      frameloop={reducedMotion ? 'demand' : paused ? 'never' : 'always'}
      camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 60 }}
      gl={{ antialias: tier === 'full', alpha: true, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {animate && (
        <PerformanceMonitor onDecline={() => setDpr(1)} flipflops={2} onFallback={() => setDpr(1)} />
      )}
      <Scene tier={tier} animate={animate} progressRef={progressRef} pointerRef={pointerRef} />
    </Canvas>
  );
}
