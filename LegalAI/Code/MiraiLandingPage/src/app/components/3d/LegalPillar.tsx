import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function CircuitLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.3;
        }
      });
    }
  });

  const lines = useMemo(() => {
    const positions: [number, number, number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const y = -1.5 + Math.random() * 3;
      const height = 0.5 + Math.random() * 1;
      positions.push([Math.cos(angle) * 0.52, y, Math.sin(angle) * 0.52, angle, height]);
    }
    return positions;
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((pos, i) => (
        <mesh
          key={i}
          position={[pos[0], pos[1], pos[2]]}
          rotation={[0, pos[3], 0]}
        >
          <boxGeometry args={[0.02, pos[4], 0.01]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function Pillar() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Column shaft */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 4, 24]} />
          <meshStandardMaterial
            color="#e8e8e8"
            metalness={0.1}
            roughness={0.3}
          />
        </mesh>

        {/* Flutes (vertical grooves) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.48, 0, Math.sin(angle) * 0.48]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.08, 3.8, 0.04]} />
              <meshStandardMaterial color="#d0d0d0" metalness={0.1} roughness={0.4} />
            </mesh>
          );
        })}

        {/* Capital (top) */}
        <group position={[0, 2.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.7, 0.5, 0.3, 32]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.3} />
          </mesh>
        </group>

        {/* Base */}
        <group position={[0, -2.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.7, 0.3, 32]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.3} />
          </mesh>
        </group>

        {/* Circuit lines overlay */}
        <CircuitLines />
      </group>
    </Float>
  );
}

export function LegalPillar() {
  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#3b82f6" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          color="#38bdf8"
        />
        <Pillar />
      </Canvas>
    </div>
  );
}
