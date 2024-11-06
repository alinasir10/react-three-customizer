import { proxy } from "valtio";

const state = proxy({
  intro: true,
  color: "#B8E986",
  isFrontLogoTexture: false,
  isBackLogoTexture: false,
  frontLogoDecal: "",
  backLogoDecal: "",
  editorTab: "color",

  frontLogoPosition: [0, 0.04, 0.15],
  frontLogoRotation: [0, 0, 0],
  frontLogoScale: 0.15,
  frontFileName: "",

  backLogoPosition: [0, 0.04, -0.15],
  backLogoRotation: [0, 0, 0],
  backLogoScale: 0.15,
  backFileName: "",

  selectedTab: "front",

  mugWrapTexture: null,
  isMugWrapTextureVisible: false,
  mugWrapFileName: "",
  mugWrapPosition: [0, 0.04, 0],
  mugWrapRotation: [0, 0, 0],
  mugWrapScale: [0.15, 0.15, 1],
});

export default state;
