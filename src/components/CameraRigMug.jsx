import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import state from "../store";

const CameraRigMug = ({ children }) => {
  const { camera, gl } = useThree();
  const snap = useSnapshot(state);
  const group = useRef();

  useEffect(() => {
    if (snap.selectedTab === "front") {
      camera.position.set(0, 0, 1.5);
      camera.lookAt(0, 0, 0);
    } else if (snap.selectedTab === "back") {
      camera.position.set(0, 0, -1.5);
      camera.lookAt(0, 0, 0);
    }
  }, [snap.selectedTab, camera]);

  return (
    <group ref={group}>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        args={[camera, gl.domElement]}
      />
      {children}
    </group>
  );
};

export default CameraRigMug;
