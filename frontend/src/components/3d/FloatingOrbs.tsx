"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedOrb({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speed;
    meshRef.current.position.y = position[1] + Math.sin(time) * 0.5;
    meshRef.current.rotation.x = time * 0.3;
    meshRef.current.rotation.y = time * 0.2;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function FloatingOrbs() {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Handle WebGL context lost/restored
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL context lost. Will attempt to restore.');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored.');
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('webglcontextlost', handleContextLost);
      canvasRef.current.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('webglcontextlost', handleContextLost);
        canvasRef.current.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 -z-10 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
        gl={{
          powerPreference: "low-power",
          antialias: false,
          preserveDrawingBuffer: false
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />

        <AnimatedOrb position={[-3, 0, -2]} color="#3b82f6" speed={0.5} />
        <AnimatedOrb position={[3, 1, -1]} color="#8b5cf6" speed={0.7} />
        <AnimatedOrb position={[0, -2, -3]} color="#06b6d4" speed={0.6} />
      </Canvas>
    </div>
  );
}
