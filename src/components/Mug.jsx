import { useEffect, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useSnapshot } from "valtio";
import state from "../store";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, FrontSide } from "three";
import * as THREE from "three";

const Mug = () => {
  const snap = useSnapshot(state);
  const { nodes } = useGLTF("/classic-mug.glb");
  const mugRef = useRef();

  const roughnessMap = useLoader(TextureLoader, "/Roughness.png");
  const wrapTexture = snap.mugWrapTexture
    ? useLoader(TextureLoader, snap.mugWrapTexture)
    : null;

  useEffect(() => {
    if (wrapTexture) {
      wrapTexture.wrapS = wrapTexture.wrapT = THREE.RepeatWrapping;
      wrapTexture.repeat.set(1, 1);
      wrapTexture.offset.set(0, 0);

      if (mugRef.current) {
        mugRef.current.material.needsUpdate = true;
      }
    }
  }, [wrapTexture]);

  const renderWrapDecal = () => {
    if (!snap.isMugWrapTextureVisible || !wrapTexture) return null;

    return (
      <Decal
        position={snap.mugWrapPosition || [0, 0.15, 0]}
        rotation={snap.mugWrapRotation || [Math.PI / 2, 0, 0]}
        scale={snap.mugWrapScale || [0.95, 0.95, 0.95]}
        map={wrapTexture}
        transparent={true}
        depthTest={true}
        depthWrite={false}
        polygonOffset={true}
        polygonOffsetFactor={-10}
        polygonOffsetUnits={-10}
        side={FrontSide}
      />
    );
  };

  return (
    <group scale={[2, 2, 2]}>
      <mesh
        ref={mugRef}
        castShadow
        geometry={nodes?.Mug?.geometry}
        dispose={null}
      >
        <meshStandardMaterial
          roughnessMap={roughnessMap}
          roughness={1}
          side={FrontSide}
          transparent={true}
          color={snap.color}
        />
        {renderWrapDecal()}
      </mesh>
    </group>
  );
};

export default Mug;
