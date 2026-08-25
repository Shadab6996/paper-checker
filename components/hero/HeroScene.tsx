"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";

type Theme = "night" | "day";

const PALETTE = {
  night: {
    planet: "#c4c7d2",
    band: "#e8eaf0",
    ring: "#c9ccd6",
    celestial: "#eef1f8",
  },
  day: {
    planet: "#ffd9a0",
    band: "#e8935a",
    ring: "#f0a868",
    celestial: "#ffd76a",
  },
};

function RadarRings({ theme }: { theme: Theme }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.02;
  });

  return (
    <group ref={group} position={[0, -1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {[0.9, 1.3, 1.7, 2.1].map((r, i) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.008 + i * 0.002, 8, 64]} />
          <meshBasicMaterial
            color={PALETTE[theme].ring}
            transparent
            opacity={0.3 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A distant sun (day) or moon (night) disc, self-lit regardless of scene
 * lighting so it stays visible against either sky. */
function CelestialBody({ theme }: { theme: Theme }) {
  return (
    <group position={[2.6, 2.3, -3.5]}>
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color={PALETTE[theme].celestial} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={PALETTE[theme].celestial}
          transparent
          opacity={theme === "day" ? 0.25 : 0.12}
        />
      </mesh>
    </group>
  );
}

/** Stars slowly rotate as a whole group (on top of drei's built-in twinkle)
 * so the field visibly drifts rather than sitting static. Hidden by day. */
function DriftingStars({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.012;
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      <Stars radius={120} depth={50} count={6000} factor={3.5} fade speed={0.4} />
    </group>
  );
}

type PlanetKind = "filled" | "banded" | "ringed";

interface PlanetConfig {
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  baseY: number;
  baseZ: number;
  size: number;
  spinSpeed: number;
  kind: PlanetKind;
}

function SketchPlanet({
  orbitRadius,
  orbitSpeed,
  initialAngle,
  baseY,
  baseZ,
  size,
  spinSpeed,
  kind,
  theme,
  name,
}: PlanetConfig & { theme: Theme; name?: string }) {
  const orbitGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (orbitGroup.current) {
      const angle = initialAngle + state.clock.elapsedTime * orbitSpeed;
      orbitGroup.current.position.x = Math.cos(angle) * orbitRadius;
      orbitGroup.current.position.z =
        baseZ + Math.sin(angle) * orbitRadius * 0.4;
      orbitGroup.current.position.y = baseY + Math.sin(angle * 1.3) * 0.25;
    }
    if (spinGroup.current) {
      spinGroup.current.rotation.y += delta * spinSpeed;
      spinGroup.current.rotation.x += delta * spinSpeed * 0.3;
    }
  });

  const bands = kind !== "filled" ? [-0.5, -0.2, 0.1, 0.4] : [];
  const colors = PALETTE[theme];

  return (
    <group ref={orbitGroup}>
      <group ref={spinGroup}>
        <mesh>
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color={colors.planet} roughness={0.9} metalness={0} />
        </mesh>
        {bands.map((b, i) => (
          <mesh
            key={i}
            position={[0, size * b, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry
              args={[size * Math.sqrt(1 - b * b) * 0.98, size * 0.012, 6, 32]}
            />
            <meshBasicMaterial color={colors.band} transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
      {/* Ring stays outside the spin group — it travels with the planet's
          orbit but doesn't tumble with its self-rotation. */}
      {kind === "ringed" && (
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[size * 1.6, size * 0.03, 8, 64]} />
          <meshBasicMaterial color={colors.band} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Name label — also outside the spin group so it stays upright and
          doesn't tumble with the planet's self-rotation. */}
      {name && (
        <Html center distanceFactor={7} position={[0, size + 0.08, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function Lights({ theme }: { theme: Theme }) {
  if (theme === "day") {
    return (
      <>
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 3, 3]} intensity={2.1} color="#ffe4a3" />
        <directionalLight position={[-4, 1, -3]} intensity={0.6} color="#8ecdfb" />
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 2, 3]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, 1, -3]} intensity={0.6} color="#8fa8ff" />
      <pointLight position={[0, 1.5, 3]} intensity={1} color="#ffffff" distance={8} />
    </>
  );
}

const PLANETS: PlanetConfig[] = [
  { orbitRadius: 3.2, orbitSpeed: 0.03, initialAngle: 0.3, baseY: 1.6, baseZ: -2, size: 0.16, spinSpeed: 0.15, kind: "filled" },
  { orbitRadius: 3.8, orbitSpeed: -0.022, initialAngle: 1.8, baseY: 1.9, baseZ: -2.4, size: 0.34, spinSpeed: 0.18, kind: "banded" },
  { orbitRadius: 4.4, orbitSpeed: 0.018, initialAngle: 3.2, baseY: 1.2, baseZ: -2.6, size: 0.3, spinSpeed: 0.16, kind: "banded" },
  { orbitRadius: 4.9, orbitSpeed: 0.014, initialAngle: 4.6, baseY: 0.4, baseZ: -2.2, size: 0.58, spinSpeed: 0.1, kind: "ringed" },
  { orbitRadius: 3.6, orbitSpeed: -0.026, initialAngle: 5.6, baseY: -0.6, baseZ: -2.5, size: 0.14, spinSpeed: 0.2, kind: "filled" },
];

export default function HeroScene({
  theme = "night",
  topNames = [],
}: {
  theme?: Theme;
  topNames?: string[];
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Lights theme={theme} />
        <DriftingStars visible={theme === "night"} />
        <CelestialBody theme={theme} />
        <RadarRings theme={theme} />
        {PLANETS.map((p, i) => (
          <SketchPlanet key={i} {...p} theme={theme} name={topNames[i]} />
        ))}
      </Canvas>
    </div>
  );
}
