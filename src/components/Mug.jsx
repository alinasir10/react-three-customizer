import { useEffect, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useSnapshot } from "valtio";
import state from "../store";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const Mug = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("./classic_mug.glb");
  const mugRef = useRef();

  const frontLogoTexture = snap.frontMugLogoDecal
    ? useLoader(TextureLoader, snap.frontMugLogoDecal)
    : null;

  const backLogoTexture = snap.backMugLogoDecal
    ? useLoader(TextureLoader, snap.backMugLogoDecal)
    : null;

  useEffect(() => {
    if (mugRef.current) {
      mugRef.current.material.color.set(snap.color);
    }
  }, [snap.color]);

  const renderDecal = (
    isTextureActive,
    decalTexture,
    position,
    rotation,
    scale
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
      ref={mugRef}
      castShadow
      geometry={nodes?.mug?.geometry}
      material={materials.color}
      material-roughness={1}
      dispose={null}
    >
      {renderDecal(
        snap.isFrontMugLogoTexture,
        frontLogoTexture,
        snap.frontMugLogoPosition || [0, 0.04, 0.15],
        snap.frontMugLogoRotation || [0, 0, 0],
        snap.frontMugLogoScale || 0.15
      )}

      {renderDecal(
        snap.isBackMugLogoTexture,
        backLogoTexture,
        snap.backMugLogoPosition || [0, 0.04, -0.15],
        snap.backMugLogoRotation || [0, 0, 0],
        snap.backMugLogoScale || 0.15
      )}
    </mesh>
  );
};

export default Mug;
