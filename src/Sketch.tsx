import * as THREE from "three"
import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Points } from "three"
import { lerp } from "three/src/math/MathUtils"

const numberOfPoints = 130

const vertex = `
    attribute float radius; 
    attribute float offset; 
    attribute float speed; 

    uniform float uTime; 
    
    varying float vOffset; 
    varying float vSpeed; 

    void main() { 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = radius;

        vOffset = offset;
        vSpeed = speed; 
    }
`

const fragment = `
    uniform float uTime; 
    varying float vOffset; 
    varying float vSpeed; 
    float PI = 3.142; 

    float rand(float n){return fract(sin(n) * 43758.5453123);}

    float noise(float p){
	    float fl = floor(p);
        float fc = fract(p);
        return mix(rand(fl), rand(fl + 1.0), fc);
    }

    void main() {
        vec2 _uv = gl_PointCoord; 
        float angle = (atan(_uv.x - 0.5, _uv.y - 0.5) / (PI * 2.0)) + 0.5; 

        float wave = vOffset + noise(uTime * vSpeed); 
        angle = (step(angle, wave) + step(angle, wave * 2.0));  
  
        vec3 colorOne = vec3(255.0 / 255.0, 153.0/255.0, 201.0 / 255.0); 
        vec3 colorTwo = vec3(88.0 / 255.0, 252.0 / 255.0, 236.0 / 255.0);
        vec3 colorThree = vec3(0.0, 0.0, 0.0); 

        vec3 color = mix(colorOne, colorTwo, angle); 
        color = mix(colorThree, colorOne, color); 

        float alpha = distance(gl_PointCoord, vec2(0.5, 0.5)); 
        alpha = 1.0 - smoothstep(0.45, 0.5, alpha); 

        if(alpha < 0.4) discard; 

        gl_FragColor = vec4(color, alpha); 
    }
`

const createPosition = (origin: number) => {
  const originSqRt = Math.sqrt(origin)
  const theta = 7 * (Math.PI * 2) * originSqRt
  const radius = 20 * originSqRt

  return [radius * Math.cos(theta), radius * Math.sin(theta)]
}

const Sketch = () => {
  const ref = useRef<Points>(null!)

  const { gl } = useThree()

  const positions = useMemo(
    () =>
      Float32Array.from(
        new Array(numberOfPoints)
          .fill(0)
          .flatMap((_, i) => [...createPosition(i / numberOfPoints), 0])
      ),
    []
  )

  const size = useMemo(
    () =>
      Float32Array.from(
        new Array(numberOfPoints)
          .fill(0)
          .flatMap(
            (_, i) =>
              40 * gl.getPixelRatio() * Math.sin(Math.PI * (i / numberOfPoints))
          )
      ),
    [gl]
  )

  const offsets = useMemo(
    () =>
      Float32Array.from(
        new Array(numberOfPoints).fill(0).flatMap(() => Math.random() * 0.1)
      ),
    []
  )

  const speed = useMemo(
    () =>
      Float32Array.from(
        new Array(numberOfPoints).fill(0).flatMap(() => Math.random())
      ),
    []
  )

  useFrame(({ mouse, clock }) => {
    //@ts-ignore
    ref.current.material.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[positions, 3]} />
        <bufferAttribute attach='attributes-radius' args={[size, 1]} />
        <bufferAttribute attach='attributes-offset' args={[offsets, 1]} />
        <bufferAttribute attach='attributes-speed' args={[speed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent={true}
      />
    </points>
  )
}

export default Sketch
