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

  backLogoPosition: [0, 0.04, -0.15],
  backLogoRotation: [0, 0, 0],
  backLogoScale: 0.15,

  frontFileName: "",
  backFileName: "",

  selectedTab: "front",
});

export default state;
