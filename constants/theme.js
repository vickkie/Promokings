import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("window");

const COLORS = {
  primary: "#2A4D50",
  // secondary: "#DDF0FF",
  secondary: "#e6d270",
  tertiary: "#FF7754",

  warning: "rgba(252, 18, 52, 0.3)",
  info: "rgba(14, 0, 255, 0.3)",
  success: "rgba(42, 77, 80, 0.6)",

  gray: "#83829A",
  gray2: "#C1C0C8",

  offwhite: "#F3F4F8",
  white: "#FFFFFF",
  black: "#000000",
  red: "#e81e4d",
  green: "#00C135",
  lightWhite: "#FAFAFC",

  themey: "#e6d270",
  // themey: "#e81e4d",// reddish
  themeg: "#F0F5F9",
  themeb: "#000",
  themew: "#fff",
  hyperlight: "#F0F5F9",
};

const SIZES = {
  xxSmall: 6,
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 44,
  height,
  width,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, SIZES, SHADOWS };
