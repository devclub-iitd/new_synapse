import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingOrb = ({ position, color, speed, size }) => {
  const meshRef = useRef();
  const initialPos = useMemo(() => [...position], []);
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current * speed;
    meshRef.current.position.x = initialPos[0] + Math.sin(t + timeOffset) * 3.5;
    meshRef.current.position.y = initialPos[1] + Math.cos(t * 0.8 + timeOffset) * 3.0;
    meshRef.current.position.z = initialPos[2] + Math.sin(t * 0.6 + timeOffset) * 2.0;
    meshRef.current.scale.setScalar(size + Math.sin(t * 0.4 + timeOffset) * 0.25);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.25}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

const FloatingParticles = ({ count = 60 }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 14,
      ],
      speed: 0.4 + Math.random() * 0.8,
      offset: Math.random() * Math.PI * 2,
      scale: 0.03 + Math.random() * 0.06,
    }));
  }, [count]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 4.5,
        p.position[1] + Math.cos(t * p.speed * 0.8 + p.offset) * 3.5,
        p.position[2] + Math.sin(t * p.speed * 0.6) * 2.5
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.4} />
    </instancedMesh>
  );
};

const Scene = () => {
  const orbs = useMemo(
    () => [
      { position: [-7, 3, -3], color: '#8b5cf6', speed: 0.55, size: 2.0 },
      { position: [6, -2, -4], color: '#6d28d9', speed: 0.45, size: 2.5 },
      { position: [0, 5, -5], color: '#a78bfa', speed: 0.6, size: 1.8 },
      { position: [-5, -4, -2], color: '#7c3aed', speed: 0.4, size: 1.5 },
      { position: [7, 2, -6], color: '#c084fc', speed: 0.5, size: 2.2 },
      { position: [-2, -5, -4], color: '#8b5cf6', speed: 0.55, size: 1.8 },
      { position: [3, 6, -3], color: '#a78bfa', speed: 0.48, size: 1.6 },
      { position: [-6, 0, -5], color: '#c084fc', speed: 0.52, size: 2.0 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#a78bfa" />
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
      <FloatingParticles count={70} />
    </>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="animated-bg-canvas">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 65 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default React.memo(AnimatedBackground);
