import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import Shirt from "../components/Shirt";
import CameraRig from "../components/CameraRig";
import ControlPanel from "../components/ControlPanel";
import state from "../store";

const CanvasLoader = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500" />
  </div>
);

const Scene = () => (
  <Suspense fallback={null}>
    <ambientLight intensity={0.5} />
    <Environment preset="city" />
    <CameraRig>
      <Center>
        <Shirt />
      </Center>
    </CameraRig>
  </Suspense>
);

const Customizer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Simulate checking if all resources are loaded
    const checkResourcesLoaded = async () => {
      try {
        // Add your resource loading checks here
        // For example, checking if textures are loaded
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Remove this in production
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkResourcesLoaded();
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
    state.editorTab = ["color", "decals", "saved"][index];
  };

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
          <CanvasLoader />
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 0, 2], fov: 25 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]} // Optimize for different pixel ratios
        className="h-full w-full transition-all ease-in"
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
        }}
      >
        <Scene />
      </Canvas>

      <ControlPanel activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Customizer;
