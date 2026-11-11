// Scene objects made from basic three.js geometry. No model files are downloaded.
// Geometries and materials declared as JSX children are disposed by React Three Fiber on unmount.
// The ones created in useMemo are disposed in effect cleanups.
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const COLORS = {
  navy: '#0B1F3A',
  teal: '#14B8A6',
  tealLight: '#5EEAD4',
  mint: '#E6FAF6',
  coral: '#FF6B57',
  blood: '#E0413A',
  white: '#F8FAFC',
};

function useDisposable(factory, deps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose?.(), [value]);
  return value;
}

/** Glass test tube with coloured liquid and a rim. */
export function TestTube({ liquid = COLORS.teal, fill = 0.55, ...props }) {
  const height = 2.2;
  const radius = 0.26;
  const liquidHeight = height * fill;

  return (
    <group {...props}>
      {/* glass body */}
      <mesh renderOrder={2}>
        <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#d6f5f2"
          transparent
          opacity={0.28}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* rounded glass bottom */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI, 0, 0]} renderOrder={2}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#d6f5f2" transparent opacity={0.28} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* liquid */}
      <mesh position={[0, -height / 2 + liquidHeight / 2, 0]}>
        <cylinderGeometry args={[radius * 0.86, radius * 0.86, liquidHeight, 32]} />
        <meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[radius * 0.86, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      {/* rim */}
      <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.08, 0.04, 12, 32]} />
        <meshStandardMaterial color={COLORS.white} metalness={0.4} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** A drop of blood: a lathe of a teardrop curve. */
export function BloodDrop(props) {
  const geometry = useDisposable(() => {
    const points = [];
    const steps = 40;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * Math.PI;
      const x = Math.sin(t) * Math.sin(t / 2) ** 1.1 * 0.62;
      const y = Math.cos(t) * 0.9;
      points.push(new THREE.Vector2(Math.max(0.0001, x), y));
    }
    return new THREE.LatheGeometry(points, 48);
  }, []);

  return (
    <mesh geometry={geometry} rotation={[0, 0, Math.PI]} {...props}>
      <meshPhysicalMaterial color={COLORS.blood} emissive="#5c0d0a" emissiveIntensity={0.4} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

/** A simple microscope: base, pillar, arm, angled tube, eyepiece and stage. */
export function Microscope(props) {
  const metal = <meshStandardMaterial color={COLORS.white} metalness={0.55} roughness={0.25} />;
  const dark = <meshStandardMaterial color="#1c3a63" metalness={0.4} roughness={0.35} />;
  return (
    <group {...props}>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[1.5, 0.18, 0.95]} />
        {dark}
      </mesh>
      <mesh position={[-0.45, -0.25, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 1.4, 20]} />
        {metal}
      </mesh>
      <mesh position={[-0.05, 0.42, 0]} rotation={[0, 0, Math.PI * 0.08]}>
        <torusGeometry args={[0.5, 0.09, 12, 32, Math.PI * 0.75]} />
        {dark}
      </mesh>
      <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.15, 0.19, 1.05, 24]} />
        {metal}
      </mesh>
      <mesh position={[0.02, 0.84, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.09, 0.12, 0.3, 20]} />
        {dark}
      </mesh>
      <mesh position={[0.45, -0.28, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 16]} />
        <meshStandardMaterial color={COLORS.teal} emissive={COLORS.teal} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.25, -0.45, 0]}>
        <boxGeometry args={[0.95, 0.06, 0.65]} />
        {metal}
      </mesh>
    </group>
  );
}

/** The DamJachai price-tag shape, extruded into 3D. */
export function useTagGeometry() {
  return useDisposable(() => {
    const s = new THREE.Shape();
    const w = 0.62;
    const h = 0.38;
    s.moveTo(-w / 2 + 0.14, h / 2);
    s.lineTo(w / 2, h / 2);
    s.lineTo(w / 2, -h / 2);
    s.lineTo(-w / 2 + 0.14, -h / 2);
    s.lineTo(-w / 2, 0);
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(-w / 2 + 0.16, 0, 0.05, 0, Math.PI * 2, false);
    s.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
    geometry.center();
    return geometry;
  }, []);
}

/** A glowing orb with a price tag in front of it. `color` is teal (cheap) or coral (expensive). */
export function PriceOrb({ color = COLORS.teal, tagGeometry, ...props }) {
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} roughness={0.2} toneMapped={false} />
      </mesh>
      {/* the soft halo: a larger back-facing sphere with additive blending */}
      <mesh scale={1.9}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {tagGeometry && (
        <mesh geometry={tagGeometry} position={[0, 0, 0.42]} scale={0.7}>
          <meshStandardMaterial color={COLORS.white} emissive={color} emissiveIntensity={0.25} metalness={0.2} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}
