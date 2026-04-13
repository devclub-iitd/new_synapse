import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RING_COUNT = 3;
const PARTICLE_COUNT = 40;

/* ---- Orbiting ring of particles ---- */
const ParticleRing = ({ radius, speed, particleCount, color, yOffset, phase }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);

  const particles = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.3,
      scale: 0.04 + Math.random() * 0.05,
    })),
  [particleCount]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current * speed;
    particles.forEach((p, i) => {
      const angle = p.angle + t + Math.sin(t * 0.7 + p.angle) * 0.3;
      const r = radius + Math.sin(t * 1.2 + p.angle * 2) * 0.15;
      dummy.position.set(
        Math.cos(angle) * r,
        yOffset + Math.sin(angle * 2 + t) * 0.25 + p.drift,
        Math.sin(angle) * r
      );
      const pulse = 0.7 + Math.sin(t * 3 + i) * 0.3;
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, particleCount]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.85} roughness={0.3} />
    </instancedMesh>
  );
};

/* ---- Central pulsing core ---- */
const Core = () => {
  const meshRef = useRef();
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    const s = 0.12 + Math.sin(elapsed.current * 2.5) * 0.03;
    meshRef.current.scale.setScalar(s);
    meshRef.current.rotation.y += delta * 0.8;
    meshRef.current.rotation.x = Math.sin(elapsed.current * 0.6) * 0.3;
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#5a9fcf"
        emissive="#5a9fcf"
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
};

/* ---- Connector lines that trace between rings ---- */
const Connectors = () => {
  const groupRef = useRef();
  const elapsed = useRef(0);
  const lineCount = 6;

  const lines = useMemo(() =>
    Array.from({ length: lineCount }, (_, i) => {
      const phase = (i / lineCount) * Math.PI * 2;
      return { phase, speed: 0.8 + Math.random() * 0.4 };
    }),
  []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const children = groupRef.current?.children;
    if (!children) return;
    lines.forEach((l, i) => {
      const t = elapsed.current * l.speed;
      const a1 = l.phase + t;
      const a2 = l.phase + t + 1.2;
      const pts = children[i]?.geometry;
      if (!pts) return;
      const positions = pts.attributes.position.array;
      positions[0] = Math.cos(a1) * 0.6; positions[1] = Math.sin(t + l.phase) * 0.3; positions[2] = Math.sin(a1) * 0.6;
      positions[3] = Math.cos(a2) * 1.1; positions[4] = Math.sin(t * 0.8 + l.phase) * 0.2; positions[5] = Math.sin(a2) * 1.1;
      pts.attributes.position.needsUpdate = true;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((_, i) => {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 1,1,1], 3));
        return (
          <line key={i} geometry={geom}>
            <lineBasicMaterial color="#8ec4e8" transparent opacity={0.3} />
          </line>
        );
      })}
    </group>
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.2} />
    <pointLight position={[2, 3, 4]} intensity={0.6} color="#8ec4e8" />
    <pointLight position={[-3, -2, 2]} intensity={0.3} color="#5a9fcf" />
    <Core />
    <ParticleRing radius={0.55} speed={1.8} particleCount={14} color="#7eb8e0" yOffset={0} phase={0} />
    <ParticleRing radius={0.85} speed={-1.2} particleCount={16} color="#5a9fcf" yOffset={0.05} phase={2} />
    <ParticleRing radius={1.15} speed={0.9} particleCount={10} color="#a0d0f0" yOffset={-0.05} phase={4} />
    <Connectors />
  </>
);

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '60vh',
      position: 'relative',
    }}>
      <div style={{ width: 180, height: 180 }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }} style={{ background: 'transparent' }}>
          <Scene />
        </Canvas>
      </div>
      <span style={{
        marginTop: 16,
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        fontFamily: 'inherit',
      }}>
        Loading
        <span className="loader-dots" />
      </span>
    </div>
  );
};

export default Loader;