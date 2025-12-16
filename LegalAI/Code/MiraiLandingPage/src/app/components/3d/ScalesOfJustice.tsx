import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Scales() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Central pillar */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 3, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Top bar */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Left pan */}
        <group position={[-1.3, 0.8, 0]}>
          {/* Chain */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Pan */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.4, 0.15, 32]} />
            <MeshDistortMaterial
              color="#d4af37"
              metalness={0.8}
              roughness={0.2}
              distort={0.1}
              speed={2}
            />
          </mesh>
        </group>

        {/* Right pan */}
        <group position={[1.3, 0.6, 0]}>
          {/* Chain */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Pan */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.4, 0.15, 32]} />
            <MeshDistortMaterial
              color="#d4af37"
              metalness={0.8}
              roughness={0.2}
              distort={0.1}
              speed={2}
            />
          </mesh>
        </group>

        {/* Base */}
        <mesh position={[0, -1.6, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
          <meshStandardMaterial color="#8b7355" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

export function ScalesOfJustice() {
  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#8b5cf6"
        />
        <Scales />
      </Canvas>
    </div>
  );
}
