import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import { Link, Route, Routes } from "react-router-dom";
import Shirt from "../components/Shirt";
import Mug from "../components/Mug";
import { CameraRig, CameraRigMug } from "../components/CameraRig";
import { ControlPanel, ControlPanelMug } from "../components/ControlPanel";
import state from "../store";

const CanvasLoader = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500" />
  </div>
);

const Scene = ({ type }) => (
  <Suspense fallback={null}>
    <ambientLight intensity={0.5} />
    <Environment preset="city" />
    {type === "shirt" ? (
      <CameraRig>
        <Center>
          <Shirt />
        </Center>
      </CameraRig>
    ) : (
      <CameraRigMug>
        <Center>
          <Mug />
        </Center>
      </CameraRigMug>
    )}
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

      <Routes>
        <Route
          path="/customizer/shirt"
          element={
            <>
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
                <Scene type="shirt" />
              </Canvas>
              <ControlPanel activeTab={activeTab} onTabChange={handleTabChange} />
            </>
          }
        />
        <Route
          path="/customizer/mug"
          element={
            <>
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
                <Scene type="mug" />
              </Canvas>
              <ControlPanelMug activeTab={activeTab} onTabChange={handleTabChange} />
            </>
          }
        />
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center h-full">
              <Link
                to="/customizer/shirt"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
              >
                Customize Shirt
              </Link>
              <Link
                to="/customizer/mug"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Customize Mug
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Customizer;
