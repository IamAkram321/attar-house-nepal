import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { MotionValue } from 'framer-motion';
import * as THREE from 'three';

interface ShowcaseSceneProps {
  scrollProgress: MotionValue<number>;
}

function ObjectEvolution({ scrollProgress }: ShowcaseSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const scrollVal = scrollProgress.get();

    if (groupRef.current) {
      // 1. Continuous rotation
      groupRef.current.rotation.y += delta * 0.15;

      // 2. Mouse parallax tilt effect (using state.pointer which yields normalized [-1, 1] coords)
      const targetMouseX = state.pointer.x * 0.4;
      const targetMouseY = -state.pointer.y * 0.4;

      // Lerp rotation smoothly towards mouse position + scroll offset
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetMouseY + (scrollVal - 0.5) * 0.3,
        0.08
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -targetMouseX * 0.5,
        0.08
      );

      // 3. Controlled scale (Reduced from 2.0 base radius down to 1.6 to avoid card clipping)
      const scaleFactor = THREE.MathUtils.lerp(
        0.8,
        0.98,
        Math.sin(scrollVal * Math.PI)
      );

      groupRef.current.scale.lerp(
        new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor),
        0.1
      );
    }

    if (wireframeRef.current) {
      // Counter-rotate wireframe on scroll
      wireframeRef.current.rotation.y = scrollVal * Math.PI * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Core solid mesh with reduced base size (args:[1.6, 2]) */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.6, 2]} />
          <meshPhysicalMaterial 
            color="#0d0d0d"
            roughness={0.15}
            metalness={0.95}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2.5}
          />
        </mesh>
        
        {/* Wireframe shell */}
        <mesh ref={wireframeRef} scale={1.12}>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial 
            color="#D4AF37" 
            wireframe 
            transparent 
            opacity={0.35} 
            emissive="#B8956A"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      </Float>
    </group>
  );
}

export function ShowcaseScene({ scrollProgress }: ShowcaseSceneProps) {
  return (
    <Canvas 
      camera={{ position: [0, 0, 6.5], fov: 45 }} 
      gl={{ 
        alpha: true, 
        antialias: true, 
        powerPreference: "high-performance" 
      }}
      style={{ background: 'transparent' }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={3} color="#f5d0a0" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#60a5fa" />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#e5a964" />
      
      <ObjectEvolution scrollProgress={scrollProgress} />
      
      <Environment preset="city" />
    </Canvas>
  );
}

export default ShowcaseScene;