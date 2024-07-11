import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../constants";

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textAlign: "center",
    color: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },

  upperRow: {
    width: SIZES.width - 30,
    marginHorizontal: SIZES.medium,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.large,
    top: SIZES.large,
    zIndex: 999,
    height: 40,
  },
  backBtn: {
    position: "absolute",
    left: 10,
  },
});

export default styles;
