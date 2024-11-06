import { useEffect, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useSnapshot } from "valtio";
import state from "../store";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("./shirt_baked.glb");
  const shirtRef = useRef();

  const frontLogoTexture = snap.frontLogoDecal
    ? useLoader(TextureLoader, snap.frontLogoDecal)
    : null;

  const backLogoTexture = snap.backLogoDecal
    ? useLoader(TextureLoader, snap.backLogoDecal)
    : null;

  useEffect(() => {
    if (shirtRef.current) {
      shirtRef.current.material.color.set(snap.color);
    }
  }, [snap.color]);

  const renderDecal = (
    isTextureActive,
    decalTexture,
    position,
    rotation,
    scale,
  ) => {
    if (!isTextureActive || !decalTexture) return null;

    return (
      <Decal
        position={position}
        rotation={rotation}
        scale={scale}
        map={decalTexture}
      />
    );
  };

  return (
    <mesh
      ref={shirtRef}
      castShadow
      geometry={nodes?.tshirt?.geometry}
      material={materials.color}
      material-roughness={1}
      dispose={null}
    >
      {renderDecal(
        snap.isFrontLogoTexture,
        frontLogoTexture,
        snap.frontLogoPosition || [0, 0.04, 0.15],
        snap.frontLogoRotation || [0, 0, 0],
        snap.frontLogoScale || 0.15,
      )}

      {renderDecal(
        snap.isBackLogoTexture,
        backLogoTexture,
        snap.backLogoPosition || [0, 0.04, -0.15],
        snap.backLogoRotation || [0, 0, 0],
        snap.backLogoScale || 0.15,
      )}
    </mesh>
  );
};

export default Shirt;
