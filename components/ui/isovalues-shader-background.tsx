"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ShaderBackgroundProps {
  className?: string;
}

interface PointerTarget {
  x: number;
  y: number;
  active: boolean;
}

function usePointerTarget() {
  const pointer = useRef<PointerTarget>({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth;
      pointer.current.y = 1 - event.clientY / window.innerHeight;
      pointer.current.active = true;
    };
    const clearPointer = (event: MouseEvent) => {
      if (!event.relatedTarget) pointer.current.active = false;
    };
    const clearOnBlur = () => {
      pointer.current.active = false;
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("mouseout", clearPointer);
    window.addEventListener("blur", clearOnBlur);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("mouseout", clearPointer);
      window.removeEventListener("blur", clearOnBlur);
    };
  }, []);

  return pointer;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

export default function IsovaluesShaderBackground({
  className = "",
}: ShaderBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const pointer = usePointerTarget();

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
          frameloop="always"
          camera={{ position: [0, 0, 1], fov: 75 }}
          className="h-full w-full"
        >
          <color attach="background" args={["#020202"]} />
          <IsovaluesShaderPlane
            reducedMotion={reducedMotion}
            pointer={pointer}
          />
        </Canvas>

      </div>
    </div>
  );
}

function IsovaluesShaderPlane({
  reducedMotion,
  pointer,
}: {
  reducedMotion: boolean;
  pointer: { current: PointerTarget };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Clean adaptation of "isovalues 3" by Fabrice Neyret:
  // https://www.shadertoy.com/view/ldfczS
  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;

    varying vec2 vUv;

    mat2 rotate2d(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    float scalarField(vec2 position, float time) {
      vec2 point = position * 2.15;
      float value = 0.0;
      float amplitude = 0.58;
      mat2 rotation = rotate2d(0.73);

      for (int octave = 0; octave < 5; octave++) {
        point += 0.2 * vec2(
          sin(point.y * 1.25 + time * 0.72),
          cos(point.x * 1.1 - time * 0.61)
        );

        value += amplitude * sin(
          point.x + sin(point.y * 1.13 + time * 0.34)
        );

        point = rotation * point * 1.68 + vec2(1.17, -0.83);
        amplitude *= 0.55;
      }

      return value;
    }

    void main() {
      vec2 position = vUv * 2.0 - 1.0;
      position.x *= uResolution.x / max(uResolution.y, 1.0);

      vec2 screenPosition = position;
      float time = uTime * 0.34;
      position += vec2(time * 0.055, -time * 0.035);

      float field = scalarField(position, time);
      float level = field * 1.72;
      float band = fract(level);
      float distanceToContour = min(band, 1.0 - band);
      float contourLine = 1.0 - smoothstep(
        0.012,
        0.045,
        distanceToContour
      );

      vec2 mousePosition = uMouse * 2.0 - 1.0;
      mousePosition.x *= uResolution.x / max(uResolution.y, 1.0);
      float distanceToMouse = length(screenPosition - mousePosition);
      float quietZone = smoothstep(0.1, 0.42, distanceToMouse);
      contourLine *= mix(1.0, quietZone, uMouseInfluence);

      float bandTone = 0.5 + 0.5 * cos(
        6.2831853 * (level * 0.115 + time * 0.018)
      );
      float intensity = 0.008 + contourLine * (0.04 + bandTone * 0.055);

      vec2 edgePosition = vUv * (1.0 - vUv);
      float vignette = pow(
        clamp(edgePosition.x * edgePosition.y * 18.0, 0.0, 1.0),
        0.2
      );
      intensity *= 0.48 + vignette * 0.52;

      gl_FragColor = vec4(vec3(intensity), 1.0);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseInfluence: { value: 0 },
    }),
    [size]
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value =
      state.clock.getElapsedTime() * (reducedMotion ? 0.25 : 1.0);
    material.uniforms.uResolution.value.set(size.width, size.height);
    const mouse = material.uniforms.uMouse.value as THREE.Vector2;
    mouse.x += (pointer.current.x - mouse.x) * 0.065;
    mouse.y += (pointer.current.y - mouse.y) * 0.065;
    material.uniforms.uMouseInfluence.value = THREE.MathUtils.lerp(
      material.uniforms.uMouseInfluence.value,
      pointer.current.active ? 1 : 0,
      0.075
    );
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
