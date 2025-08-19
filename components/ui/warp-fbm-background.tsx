"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface WarpFbmBackgroundProps {
  className?: string;
}

export default function WarpFbmBackground({
  className = "",
}: WarpFbmBackgroundProps) {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        dpr={[1, 1.5]}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["transparent"]} />
        <WarpFbmShader />
      </Canvas>
    </div>
  );
}

function WarpFbmShader() {
  const { viewport, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const time = useRef(0);

  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    time.current += delta;

    // Update uniforms
    materialRef.current.uniforms.iTime.value = time.current;
    materialRef.current.uniforms.iResolution.value.set(size.width, size.height);
  });

  // Create shader material
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float iTime;
      uniform vec2 iResolution;
      
      varying vec2 vUv;
      
      float colormap_red(float x) {
          x = clamp(x, 0.0, 1.0);
          if (x < 0.4) {
              // Dark blue to blue transition - minimal red
              return x * 0.1 / 0.4; // Goes from 0 to 0.1
          } else if (x < 0.7) {
              // Blue to yellow transition
              return 0.1 + (x - 0.4) * 0.9 / 0.3; // Goes from 0.1 to 1.0
          } else {
              // Yellow to white - keep red high
              return 1.0;
          }
      }

      float colormap_green(float x) {
          x = clamp(x, 0.0, 1.0);
          if (x < 0.3) {
              // Dark blue - minimal green
              return x * 0.2 / 0.3; // Goes from 0 to 0.2
          } else if (x < 0.6) {
              // Transition to yellow
              return 0.2 + (x - 0.3) * 0.8 / 0.3; // Goes from 0.2 to 1.0
          } else {
              // Yellow to white - keep green high
              return 1.0;
          }
      }

      float colormap_blue(float x) {
          x = clamp(x, 0.0, 1.0);
          if (x < 0.5) {
              // Dark blue to bright blue
              return 0.2 + x * 0.8 / 0.5; // Goes from 0.2 to 1.0
          } else if (x < 0.8) {
              // Blue to yellow transition - reduce blue
              return 1.0 - (x - 0.5) * 1.0 / 0.3; // Goes from 1.0 to 0.0
          } else {
              // Yellow to white - add blue back for white
              return (x - 0.8) * 1.0 / 0.2; // Goes from 0.0 to 1.0
          }
      }

      vec4 colormap(float x) {
          x = clamp(x, 0.0, 1.0);
          vec3 color = vec3(colormap_red(x), colormap_green(x), colormap_blue(x));
          // Clamp final color values to prevent overflow
          color = clamp(color, 0.0, 1.0);
          return vec4(color, 1.0);
      }

      float rand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p){
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
              mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
              mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
          return res*res;
      }

      const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

      float fbm( vec2 p )
      {
          float f = 0.0;

          f += 0.500000*noise( p + iTime  ); p = mtx*p*2.02;
          f += 0.031250*noise( p ); p = mtx*p*2.01;
          f += 0.250000*noise( p ); p = mtx*p*2.03;
          f += 0.125000*noise( p ); p = mtx*p*2.01;
          f += 0.062500*noise( p ); p = mtx*p*2.04;
          f += 0.015625*noise( p + sin(iTime) );

          return f/0.96875;
      }

      float pattern( in vec2 p )
      {
          return fbm( p + fbm( p + fbm( p ) ) );
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord )
      {
          vec2 uv = fragCoord/iResolution.xy;
          // Scale UV to maintain aspect ratio and create more interesting patterns
          uv.x *= iResolution.x / iResolution.y;
          
          float shade = pattern(uv * 2.0); // Scale up for more detail
          
          // Enhance contrast for more dramatic effect
          shade = pow(shade, 0.8);
          
          // Clamp the shade value to prevent bright whites
          shade = clamp(shade, 0.0, 1.0);
          
          vec3 color = colormap(shade).rgb;
          
          // Smooth fade-in from black over the first 2 seconds
          float fadeIn = smoothstep(0.0, 2.0, iTime);
          
          // Apply fade-in to the color, starting from black
          color *= fadeIn;
          
          fragColor = vec4(color, 1.0);
      }
      
      void main() {
          vec4 fragColor;
          mainImage(fragColor, vUv * iResolution.xy);
          gl_FragColor = fragColor;
      }
    `,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
    },
    transparent: true,
    blending: THREE.NormalBlending,
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
