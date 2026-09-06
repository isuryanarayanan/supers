"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface MatrixShaderBackgroundProps {
  className?: string;
}

export default function MatrixShaderBackground({
  className = "",
}: MatrixShaderBackgroundProps) {
  return (
    <div className={className} aria-hidden="true">
      <div className="fixed inset-0 z-0 bg-black">
        <Canvas
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            alpha: false,
          }}
          dpr={[1, 1.25]}
          camera={{ position: [0, 0, 1], fov: 75 }}
          className="h-full w-full"
        >
          <color attach="background" args={["#020202"]} />
          <AmbientShaderPlane />
        </Canvas>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,rgba(0,0,0,0.22)_42%,rgba(0,0,0,0.88)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent" />
      </div>
    </div>
  );
}

function AmbientShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uBase;
    uniform vec3 uMist;
    uniform vec3 uSilver;
    uniform vec3 uWarm;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);

      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p = rotate * p * 2.02 + 17.13;
        amplitude *= 0.48;
      }

      return value;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= aspect;

      vec2 mouse = uMouse * 2.0 - 1.0;
      mouse.x *= aspect;
      float mouseGlow = smoothstep(0.85, 0.0, length(p - mouse));

      float t = uTime * 0.055;
      float softField = fbm(p * 1.28 + vec2(t, -t * 0.7));
      float slowField = fbm(p * 2.1 + vec2(-t * 0.55, t * 0.35));

      float center = 1.0 - smoothstep(0.08, 1.15, length(p * vec2(0.72, 1.0)));
      float diagonal = smoothstep(0.72, 0.05, abs(p.y + p.x * 0.18 + sin(uTime * 0.09) * 0.08));
      float upperBloom = exp(-length((p - vec2(-0.22, 0.18)) * vec2(1.2, 0.86)) * 1.65);
      float lowerBloom = exp(-length((p - vec2(0.38, -0.42)) * vec2(1.0, 1.4)) * 1.9);

      float mist = smoothstep(0.28, 0.92, softField) * 0.22;
      float sheen = smoothstep(0.62, 0.96, slowField + diagonal * 0.18) * 0.18;
      float vignette = 1.0 - smoothstep(0.55, 1.55, length(p));

      vec3 color = uBase;
      color = mix(color, uMist, mist * (0.65 + center * 0.55));
      color += uSilver * sheen * (0.45 + upperBloom * 0.45);
      color += uWarm * lowerBloom * 0.05;
      color += uSilver * mouseGlow * 0.045;
      color *= 0.58 + vignette * 0.56;

      float grain = hash(uv * uResolution.xy + floor(uTime * 12.0));
      color += (grain - 0.5) * 0.012;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uBase: { value: new THREE.Color("#020202") },
      uMist: { value: new THREE.Color("#161a20") },
      uSilver: { value: new THREE.Color("#8f98a6") },
      uWarm: { value: new THREE.Color("#5a5249") },
    }),
    [size]
  );

  useFrame((state) => {
    const { clock, pointer } = state;
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uResolution.value.set(size.width, size.height);

    const targetX = (pointer.x + 1) * 0.5;
    const targetY = (pointer.y + 1) * 0.5;
    material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.045;
    material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.045;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial fragmentShader={fragmentShader} vertexShader={vertexShader} uniforms={uniforms} />
    </mesh>
  );
}
