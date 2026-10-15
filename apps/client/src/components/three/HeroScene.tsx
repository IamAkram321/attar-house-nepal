import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Sculpture() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} castShadow receiveShadow scale={1.0}>
        <torusKnotGeometry args={[1.5, 0.4, 256, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#B8956A" // Warm bronze/gold
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full bg-transparent">
      <color attach="background" args={['transparent']} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight position={[-5, 5, -5]} intensity={1} color="#FFD700" />

      <PresentationControls
        global
        cursor
        speed={1.2}
        zoom={1}
        rotation={[0, 0.3, 0]}
        polar={[-0.45, 0.45]}
        azimuth={[-1, 1]}
      >
        <Sculpture />
      </PresentationControls>

      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      <Environment preset="studio" />
    </Canvas>
  );
}

export default HeroScene;
