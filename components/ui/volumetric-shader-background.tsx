"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface VolumetricShaderBackgroundProps {
  className?: string;
}

export default function VolumetricShaderBackground({
  className = "",
}: VolumetricShaderBackgroundProps) {
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
        <VolumetricShader />
      </Canvas>
    </div>
  );
}

function VolumetricShader() {
  const { viewport, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const time = useRef(0);

  // Create a noise texture
  const noiseTexture = useRef<THREE.DataTexture | null>(null);
  
  useEffect(() => {
    // Create a simple noise texture
    const width = 256;
    const height = 256;
    const data = new Uint8Array(width * height * 4);
    
    for (let i = 0; i < width * height; i++) {
      // Removed unused variables x and y to fix lint errors
      
      // Simple noise generation
      const noise = Math.random();
      const index = i * 4;
      data[index] = noise * 255;     // R
      data[index + 1] = noise * 255; // G
      data[index + 2] = noise * 255; // B
      data[index + 3] = 255;         // A
    }
    
    noiseTexture.current = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    noiseTexture.current.needsUpdate = true;
    
    if (materialRef.current) {
      materialRef.current.uniforms.iChannel0.value = noiseTexture.current;
    }
  }, []);

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
      uniform sampler2D iChannel0;
      
      varying vec2 vUv;
      
      #define T iTime
      #define r(v,t) { float a = (t)*T; float c=cos(a); float s=sin(a); v*=mat2(c,s,-s,c); }
      #define SQRT3_2  1.26
      #define SQRT2_3  1.732
      #define smin(a,b) (1./(1./(a)+1./(b)))

      // --- noise functions from https://www.shadertoy.com/view/XslGRr
      // Created by inigo quilez - iq/2013
      // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

      const mat3 m = mat3( 0.00,  0.80,  0.60,
                          -0.80,  0.36, -0.48,
                          -0.60, -0.48,  0.64 );

      float hash( float n ) {
          return fract(sin(n)*43758.5453);
      }

      float noise( in vec3 x ) { // in [0,1]
          vec3 p = floor(x);
          vec3 f = fract(x);

          f = f*f*(3.-2.*f);

          float n = p.x + p.y*57. + 113.*p.z;

          float res = mix(mix(mix( hash(n+  0.), hash(n+  1.),f.x),
                              mix( hash(n+ 57.), hash(n+ 58.),f.x),f.y),
                          mix(mix( hash(n+113.), hash(n+114.),f.x),
                              mix( hash(n+170.), hash(n+171.),f.x),f.y),f.z);
          return res;
      }

      float fbm( vec3 p ) { // in [0,1]
          float f;
          f  = 0.5000*noise( p ); p = m*p*2.02;
          f += 0.2500*noise( p ); p = m*p*2.03;
          f += 0.1250*noise( p ); p = m*p*2.01;
          f += 0.0625*noise( p );
          return f;
      }
      // --- End of: Created by inigo quilez --------------------

      // --- more noise

      #define snoise(x) (2.*noise(x)-1.)

      float sfbm( vec3 p ) { // in [-1,1]
          float f;
          f  = 0.5000*snoise( p ); p = m*p*2.02;
          f += 0.2500*snoise( p ); p = m*p*2.03;
          f += 0.1250*snoise( p ); p = m*p*2.01;
          f += 0.0625*snoise( p );
          return f;
      }

      #define sfbm3(p) vec3(sfbm(p), sfbm(p-327.67), sfbm(p+327.67))

      // --- using the base ray-marcher of Trisomie21: https://www.shadertoy.com/view/4tfGRB#

      vec4 bg = vec4(0.0, 0.2, 0.0, 0.0);

      void mainImage( out vec4 f, vec2 w ) {
          vec4 p = vec4(w,0,1)/iResolution.yyxy-.5; 
          vec4 d, c; 
          p.x-=.4; // init ray 
          // (p.xz,.13); r(p.yz,.2); r(p.xy,.1);   // camera rotations
          d = p; 
          p.z += 10.0;                        // ray dir = ray0-vec3(0)
          // p = -vec4(0,.5,1,0)*T;
          f = vec4(bg);
          float x1,x2,x=1e9;
          
          for (float i=1.; i>0.; i-=.01)  {
              if (f.x>=.99) break; // windows bug: miss it if at end ! thanks Dave_Hoskins
              
              vec4 u = .03*floor(p/vec4(8,8,1,1)+3.5);
              vec4 t = p;
              r(t.xy,u.x); 
              r(t.xz,u.y); //r(t.yz,1.);    // objects rotations

              // x1 =length(t.xyz)-7.; // if you prefer the clean trim
              t.xyz += sfbm3(t.xyz/2.+vec3(.5*T,0,0))*(.6+8.*(.5-.5*cos(T/16.)));
              c = 5.*texture(iChannel0,t.xy).rrrr;
       
              x = abs(mod(length(t.xyz),1.)-1./2.);
              x1 = length(t.xyz)-7.; 
              x = max(x,x1);
              if ((x1>.1) && (p.z<0.)) break; // optimization
              //x = max(x,-abs(t.x)+.2);
              //x = max(x,-abs(t.y)+.2);
              
              if(x<.01) { // hit !
                    f += (1.-f)*.2*mix(bg,c,i*i); 
                    x=.1; 
                    //if (f.x>=.99) break; // compiler bug on windows -> moved to begin of loop
                  }  // color texture + black fog 
              
              p += d*x;           // march ray
           }
      }
      
      void main() {
          vec4 fragColor;
          mainImage(fragColor, vUv * iResolution);
          gl_FragColor = fragColor;
      }
    `,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iChannel0: { value: null },
    },
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
