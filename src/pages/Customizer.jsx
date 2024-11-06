import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Shirt from "../components/Shirt";
import Mug from "../components/Mug";
import { CameraRig, CameraRigMug } from "../components/CameraRig";
import { ControlPanelMug, ControlPanel } from "../components/ControlPanel";
import state from "../store";

const CanvasLoader = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500" />
  </div>
);

const Scene = ({ type }) => (
  <>
    <ambientLight intensity={0.4} />
    <spotLight
      position={[10, 15, 10]}
      angle={0.2}
      penumbra={1}
      intensity={1}
      castShadow
    />
    <directionalLight
      position={[-5, 5, 5]}
      intensity={0.8}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      castShadow
    />
    <Environment preset="sunset" />

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
  </>
);

const CustomizerScene = () => {
  const { type } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleTabChange = (index) => {
    setActiveTab(index);
    state.editorTab = ["color", "decals", "saved"][index];
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
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
        dpr={[1, 2]}
        className="h-full w-full transition-all ease-in"
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          setIsLoading(false);
        }}
      >
        <Scene type={type} />
      </Canvas>
      {type === "shirt" ? (
        <ControlPanel activeTab={activeTab} onTabChange={handleTabChange} />
      ) : (
        <ControlPanelMug activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </>
  );
};

const Home = () => (
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
);

const Customizer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkResourcesLoaded = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkResourcesLoaded();
  }, []);

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
        <Route path="/" element={<Home />} />
        <Route path="/customizer/:type" element={<CustomizerScene />} />
      </Routes>
    </div>
  );
};

export default Customizer;
