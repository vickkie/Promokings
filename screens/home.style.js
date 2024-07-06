import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../constants";

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    marginHorizontal: 22,
    marginTop: SIZES.small,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartCount: {
    position: "relative",
    bottom: 0,
    height: 24,
    width: 24,
    borderRadius: 8,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightWhite,
    borderRadius: 700,
    backgroundColor: COLORS.green,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.green,
    width: 16,
    height: 16,
    justifyContent: "center",
    borderRadius: 100,
    position: "absolute",
    right: 0,
    top: 0,
    alignItems: "center",
  },
});

export default styles;
