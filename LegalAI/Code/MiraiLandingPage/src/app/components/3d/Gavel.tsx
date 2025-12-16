import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function AuroraEffect() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <torusGeometry args={[2, 0.8, 16, 100]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GavelModel() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (headRef.current) {
      // Subtle tapping motion
      const tap = Math.sin(state.clock.elapsedTime * 3) * 0.02;
      headRef.current.position.y = 0.8 + (tap > 0 ? tap : 0);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Gavel head */}
        <group ref={headRef} position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}>
          {/* Main cylinder */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 1.4, 32]} />
            <meshStandardMaterial
              color="#4a3728"
              metalness={0.2}
              roughness={0.7}
            />
          </mesh>
          {/* End caps */}
          <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.15, 32]} />
            <meshStandardMaterial color="#3d2d1f" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.15, 32]} />
            <meshStandardMaterial color="#3d2d1f" metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Metal bands */}
          <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.36, 0.03, 8, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.36, 0.03, 8, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Handle */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 2.2, 16]} />
          <meshStandardMaterial
            color="#5c4033"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Handle grip */}
        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.4, 16]} />
          <meshStandardMaterial color="#2d1f14" metalness={0.2} roughness={0.7} />
        </mesh>

        {/* Sound block */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.9, 1, 0.3, 32]} />
          <meshStandardMaterial
            color="#3d2d1f"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Aurora effect */}
        <AuroraEffect />
      </group>
    </Float>
  );
}

export function Gavel() {
  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[5, -5, -5]} intensity={0.4} color="#3b82f6" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#8b5cf6"
        />
        <GavelModel />
      </Canvas>
    </div>
  );
}
