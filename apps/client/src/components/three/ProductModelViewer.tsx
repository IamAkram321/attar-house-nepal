import { Component, Suspense, useMemo, type ReactNode } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Matches the bronze/gold material used on the homepage hero (HeroScene.tsx)
// so the product viewer feels like the same world, not a bolted-on widget.
const MODEL_MATERIAL_PROPS = {
  color: '#B8956A',
  roughness: 0.3,
  metalness: 0.6,
  envMapIntensity: 1.2,
} as const;

const TARGET_SIZE = 2.4; // world units a model's longest dimension is normalized to

function StlModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  const normalized = useMemo(() => {
    const geo = geometry.clone();
    geo.center();
    geo.computeBoundingBox();
    const size = new THREE.Vector3();
    geo.boundingBox!.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) geo.scale(TARGET_SIZE / maxDim, TARGET_SIZE / maxDim, TARGET_SIZE / maxDim);
    return geo;
  }, [geometry]);

  return (
    <mesh geometry={normalized} castShadow receiveShadow>
      <meshStandardMaterial {...MODEL_MATERIAL_PROPS} />
    </mesh>
  );
}

function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);

  const { model, scale, offset } = useMemo(() => {
    const clone = obj.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial(MODEL_MATERIAL_PROPS);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { model: clone, scale: scaleFactor, offset: center.multiplyScalar(-1) };
  }, [obj]);

  // Center first (inner primitive), then scale the whole centered result
  // (outer group) — composing these as separate nodes keeps the math correct,
  // since applying both to one object's transform at once would scale the
  // centering offset too.
  return (
    <group scale={scale}>
      <primitive object={model} position={offset} />
    </group>
  );
}

function GlbModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);

  // Unlike STL/OBJ (which usually carry no material data at all), GLB files
  // typically already include real, artist-authored materials, colors, and
  // even textures. Overriding those with the flat bronze material would
  // throw away exactly what makes GLB worth supporting — so here we only
  // center and normalize scale, and leave appearance untouched.
  const { model, scale, offset } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { model: clone, scale: scaleFactor, offset: center.multiplyScalar(-1) };
  }, [gltf]);

  return (
    <group scale={scale}>
      <primitive object={model} position={offset} />
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="text-xs uppercase tracking-widest text-muted-foreground bg-background/90 px-3 py-2 rounded whitespace-nowrap">
        Loading model...
      </div>
    </Html>
  );
}

function UnsupportedFormat({ url, extension }: { url: string; extension: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-card">
      <div className="text-center px-6">
        <p className="text-sm text-muted-foreground mb-3">
          3D preview isn't supported for .{extension} files in the browser yet.
        </p>
        <a href={url} download className="text-sm text-primary underline underline-offset-4">
          Download the model file
        </a>
      </div>
    </div>
  );
}

interface ViewerErrorBoundaryProps {
  children: ReactNode;
}
interface ViewerErrorBoundaryState {
  hasError: boolean;
}

class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  state: ViewerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ProductModelViewer] Failed to load 3D model', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-card">
          <p className="text-sm text-muted-foreground px-6 text-center">
            Couldn't load the 3D preview. The photos above are still available.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProductModelViewerProps {
  url: string;
}

export function ProductModelViewer({ url }: ProductModelViewerProps) {
  const extension = url.split('.').pop()?.toLowerCase() ?? '';

  if (extension !== 'stl' && extension !== 'obj' && extension !== 'glb') {
    return <UnsupportedFormat url={url} extension={extension} />;
  }

  return (
    <ViewerErrorBoundary>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full">
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <spotLight position={[-5, 5, -5]} intensity={0.8} color="#FFD700" />

        <Suspense fallback={<Loader />}>
          {extension === 'stl' && <StlModel url={url} />}
          {extension === 'obj' && <ObjModel url={url} />}
          {extension === 'glb' && <GlbModel url={url} />}
          <Environment preset="studio" />
        </Suspense>

        <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={8} blur={2} far={4} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
      </Canvas>
    </ViewerErrorBoundary>
  );
}

export default ProductModelViewer;