import "./App.css"
import { Canvas } from "@react-three/fiber"
import Sketch from "./Sketch"

const App = () => (
  <div className='App'>
    <Canvas orthographic camera={{ zoom: 15 }}>
      <Sketch />
    </Canvas>
  </div>
)
export default App
